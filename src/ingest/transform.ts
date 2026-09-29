import Parser from "rss-parser";
import { load as loadCheerio } from "cheerio";
import type { PHP_FEEDS, PODCAST_FEEDS, YOUTUBE_CHANNELS } from "../config/feeds";
import { extractImageFromHtml } from "../utils/extractImage";
import { slugify } from "../utils/slugify";
import { cleanTitle } from "../utils/cleanTitle";
import { extractTags } from "../utils/extractTags";
import { cleanAndTagUrl } from "../utils/cleanAndTagUrl";

/**
 * Turning a feed item into a content record.
 *
 * This used to live inside Astro content loaders that ran during the build,
 * cleared the store and refetched everything. That made the site a mirror of
 * whatever was in each feed at build time rather than an archive: anything
 * that scrolled out of a feed left the site for good, and a feed that was
 * down during a build silently removed its whole publication.
 *
 * So the transforms are pure and live here, the fetching and writing happen
 * in scripts/ingest.ts, and the collections read files from disk. The
 * derivation is unchanged, deliberately: the ids it produces are the site's
 * URLs and must stay exactly as they were.
 */

export const parser = new Parser({
  customFields: {
    item: [
      ["itunes:duration", "duration"],
      ["itunes:episode", "episode"],
      ["itunes:season", "season"],
      ["itunes:summary", "summary"],
      ["itunes:image", "itunesImage"],
      ["yt:videoId", "videoId"],
      ["media:group", "mediaGroup"],
    ],
  },
});

export type Record = { id: string; data: Record_ };
export type Record_ = { [key: string]: unknown };

export function safeString(val: any): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    return val["_"] || val["$"]?.["href"] || "";
  }
  return val || "";
}

function newsId(feed: { url: string; label: string }, item: any): string {
  try {
    const baseUrl = feed.url.startsWith("http") ? new URL(feed.url).origin : "https://phponline.dev";
    const urlObj = new URL(item.link || "", baseUrl);

    let pathSlug = urlObj.pathname.split("/").filter(Boolean).join("-");

    if (!pathSlug || pathSlug.includes("index.php")) {
      pathSlug = urlObj.hash
        ? urlObj.hash.replace("#", "")
        : slugify(cleanTitle(safeString(item.title)) || "article");
    }

    pathSlug = pathSlug.replace(/[\[\]\(\)]/g, "");

    return `${slugify(feed.label)}/${pathSlug}`;
  } catch {
    return `${slugify(feed.label)}/${slugify(cleanTitle(safeString(item.title)) || "article")}`;
  }
}

function stripImagesAndEmptyParagraphs(content: string): string {
  try {
    const $ = loadCheerio(content);
    $("img").remove();
    $("p").each((_, el) => {
      if ($(el).text().trim().length === 0 && $(el).find("*").length === 0) {
        $(el).remove();
      }
    });
    return $.html();
  } catch {
    return content;
  }
}

/**
 * RFC state, read out of the title because php.net's RFC feed carries it
 * nowhere else.
 */
function rfcStatus(title: string | undefined, feedId: string | undefined): string | undefined {
  if (!feedId?.includes("rfc")) return undefined;
  if (!title) return "Discussion";

  const t = title.toUpperCase();
  if (t.includes("VOTING")) return "Voting";
  if (t.includes("ACCEPTED")) return "Accepted";
  if (t.includes("DECLINED")) return "Declined";
  if (t.includes("IMPLEMENTED")) return "Implemented";
  if (t.includes("UNDER DISCUSSION")) return "Discussion";
  return "RFC";
}

export function newsRecords(feed: (typeof PHP_FEEDS)[number], parsed: any): Record[] {
  return (parsed.items ?? []).map((item: any) => {
    const raw = safeString(item.content || item.contentSnippet || item.summary || "");
    const coverImage = item.enclosure?.url || extractImageFromHtml(raw);
    const content = stripImagesAndEmptyParagraphs(raw);

    return {
      id: newsId(feed, item),
      data: {
        title: cleanTitle(safeString(item.title)),
        link: cleanAndTagUrl(item.link),
        coverImage,
        pubDate: new Date(item.pubDate || ""),
        content,
        source: feed.label,
        author: item.creator || parsed.title,
        status: rfcStatus(safeString(item.title), (feed as any).id),
        creatorId: (feed as any).creatorId,
        tags: extractTags(safeString(item.title) || "", content),
      },
    };
  });
}

export function episodeRecords(podcast: (typeof PODCAST_FEEDS)[number], parsed: any): Record[] {
  const isImage = (url: any) => typeof url === "string" && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);

  return (parsed.items ?? []).map((item: any) => {
    let coverImage = safeString(item.itunesImage) || parsed.image?.url;

    // An enclosure is the audio on most podcast feeds and the artwork on a
    // few, so it is only trusted when it looks like an image. Without this
    // the cover ends up being an MP3 URL.
    const enclosureUrl = item.enclosure?.url;
    if (enclosureUrl && isImage(enclosureUrl)) {
      coverImage = enclosureUrl;
    } else if (coverImage && !isImage(coverImage)) {
      coverImage = parsed.image?.url;
    }

    return {
      id: `${slugify(podcast.title)}/${slugify(cleanTitle(safeString(item.title)) || "episode")}`,
      data: {
        title: cleanTitle(safeString(item.title)),
        link: cleanAndTagUrl(item.link),
        pubDate: new Date(item.pubDate || ""),
        content: safeString(item.summary || item.contentSnippet || item.content || ""),
        coverImage,
        podcast: podcast.title,
        audioUrl: item.enclosure?.url,
        duration: safeString(item.duration),
        episode: safeString(item.episode),
        season: safeString(item.season),
        creatorId: (podcast as any).creatorId,
      },
    };
  });
}

export function videoRecords(channel: (typeof YOUTUBE_CHANNELS)[number], parsed: any): Record[] {
  return (parsed.items ?? []).map((item: any) => {
    const videoId = item.videoId || item.id?.split(":")?.pop();

    let thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    if (item.mediaGroup && item.mediaGroup["media:thumbnail"]) {
      thumbnail = item.mediaGroup["media:thumbnail"][0].$.url;
    }

    return {
      id: `${slugify(channel.label)}/${slugify(cleanTitle(safeString(item.title)) || "video")}`,
      data: {
        title: cleanTitle(safeString(item.title)),
        link: cleanAndTagUrl(item.link),
        pubDate: new Date(item.pubDate || ""),
        content: safeString(item.contentSnippet || item.content || ""),
        channel: channel.label,
        videoId,
        thumbnail,
        creatorId: (channel as any).creatorId,
      },
    };
  });
}

export function youtubeFeedUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}
