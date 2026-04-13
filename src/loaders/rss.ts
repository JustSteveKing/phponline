/// <reference types="astro/client" />
import Parser from "rss-parser";
import type { Loader, LoaderContext } from "astro/loaders";
import { load as loadCheerio } from "cheerio";
import type { PHP_FEEDS, PODCAST_FEEDS, YOUTUBE_CHANNELS } from "@/config/feeds";
import { extractImageFromHtml } from "@/utils/extractImage";
import { slugify } from "@/utils/slugify";
import { cleanTitle } from "@/utils/cleanTitle";
import { extractTags } from "@/utils/extractTags";
import { cleanAndTagUrl } from "@/utils/cleanAndTagUrl";

const parser = new Parser({
    customFields: {
        item: [
            ['itunes:duration', 'duration'],
            ['itunes:episode', 'episode'],
            ['itunes:season', 'season'],
            ['itunes:summary', 'summary'],
            ['itunes:image', 'itunesImage'],
            ['yt:videoId', 'videoId'],
            ['media:group', 'mediaGroup'],
        ],
    },
});

function safeString(val: any): string {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') {
        return val['_'] || val['$']?.['href'] || "";
    }
    return val || "";
}

export function phpCommunityLoader(feedUrls: typeof PHP_FEEDS): Loader {
  return {
    name: "php-community-loader",
    load: async ({ store, logger }: LoaderContext) => {
      logger.info("Fetching PHP community feeds...");
      
      store.clear();

      for (const feed of feedUrls) {
        try {
          const data = await parser.parseURL(feed.url);

          data.items.forEach((item) => {
            let id = "";
            try {
                const baseUrl = feed.url.startsWith('http') ? new URL(feed.url).origin : "https://phponline.dev";
                const urlObj = new URL(item.link || "", baseUrl);
                
                let pathSlug = urlObj.pathname
                    .split('/')
                    .filter(Boolean)
                    .join('-');
                
                if (!pathSlug || pathSlug.includes('index.php')) {
                    if (urlObj.hash) {
                        pathSlug = urlObj.hash.replace('#', '');
                    } else {
                        pathSlug = slugify(cleanTitle(safeString(item.title)) || 'article');
                    }
                }
                
                pathSlug = pathSlug.replace(/[\[\]\(\)]/g, '');
                const sourceSlug = slugify(feed.label);
                id = `${sourceSlug}/${pathSlug}`;
            } catch (e) {
                id = `${slugify(feed.label)}/${slugify(cleanTitle(safeString(item.title)) || 'article')}`;
            }

            let content = safeString(item.content || item.contentSnippet || (item as any).summary || "");
            const coverImage = item.enclosure?.url || extractImageFromHtml(content);

            try {
                const $ = loadCheerio(content);
                $('img').remove();
                $('p').each((_, el) => {
                    if ($(el).text().trim().length === 0 && $(el).find('*').length === 0) {
                        $(el).remove();
                    }
                });
                content = $.html();
            } catch (e) {
            }

            const getStatus = (title: string | undefined, feedId: string | undefined) => {
              if (!feedId?.includes('rfc')) return undefined;
              if (!title) return 'Discussion';
              const t = title.toUpperCase();
              if (t.includes('VOTING')) return 'Voting';
              if (t.includes('ACCEPTED')) return 'Accepted';
              if (t.includes('DECLINED')) return 'Declined';
              if (t.includes('IMPLEMENTED')) return 'Implemented';
              if (t.includes('UNDER DISCUSSION')) return 'Discussion';
              return 'RFC';
            };

            store.set({
              id,
              data: {
                title: cleanTitle(safeString(item.title)),
                link: cleanAndTagUrl(item.link),
                coverImage: coverImage,
                pubDate: new Date(item.pubDate || ""),
                content: content,
                source: feed.label,
                author: item.creator || data.title,
                status: getStatus(safeString(item.title), feed.id),
                creatorId: feed.creatorId,
                tags: extractTags(safeString(item.title) || "", content),
              },
            });
          });
        } catch (e) {
          logger.error(`Failed to load ${feed.url}: ${e}`);
        }
      }
    },
  };
}

export function phpPodcastLoader(podcasts: typeof PODCAST_FEEDS): Loader {
  return {
    name: "php-podcast-loader",
    load: async ({ store, logger }: LoaderContext) => {
      logger.info("Fetching PHP podcast episodes...");
      
      store.clear();

      for (const podcast of podcasts) {
        try {
          const data = await parser.parseURL(podcast.feed);

          data.items.forEach((item) => {
            const episodeSlug = slugify(cleanTitle(safeString(item.title)) || 'episode');
            const podcastSlug = slugify(podcast.title);
            const id = `${podcastSlug}/${episodeSlug}`;

            // Image handling for podcasts
            let coverImage = safeString((item as any).itunesImage) || data.image?.url;
            
            // If the enclosure is an image, use it, otherwise don't use it (avoid MP3s)
            const enclosureUrl = item.enclosure?.url;
            const isImage = (url: any) => typeof url === 'string' && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
            
            if (enclosureUrl && isImage(enclosureUrl)) {
              coverImage = enclosureUrl;
            } else if (coverImage && !isImage(coverImage)) {
              // Fallback to podcast global image if episode image is invalid
              coverImage = data.image?.url;
            }

            store.set({
              id,
              data: {
                title: cleanTitle(safeString(item.title)),
                link: cleanAndTagUrl(item.link),
                pubDate: new Date(item.pubDate || ""),
                content: safeString((item as any).summary || item.contentSnippet || item.content || ""),
                coverImage: coverImage,
                podcast: podcast.title,
                audioUrl: item.enclosure?.url,
                duration: safeString((item as any).duration),
                episode: safeString((item as any).episode),
                season: safeString((item as any).season),
                creatorId: podcast.creatorId,
              },
            });
          });
        } catch (e) {
          logger.error(`Failed to load podcast ${podcast.title}: ${e}`);
        }
      }
    },
  };
}

export function phpYouTubeLoader(channels: typeof YOUTUBE_CHANNELS): Loader {
  return {
    name: "php-youtube-loader",
    load: async ({ store, logger }: LoaderContext) => {
      logger.info("Fetching PHP YouTube videos...");
      
      store.clear();

      for (const channel of channels) {
        try {
          const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
          const data = await parser.parseURL(feedUrl);

          data.items.forEach((item: any) => {
            const videoId = item.videoId || item.id?.split(':')?.pop();
            const videoSlug = slugify(cleanTitle(safeString(item.title)) || 'video');
            const channelSlug = slugify(channel.label);
            const id = `${channelSlug}/${videoSlug}`;

            let thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
            if (item.mediaGroup && item.mediaGroup['media:thumbnail']) {
                thumbnail = item.mediaGroup['media:thumbnail'][0].$.url;
            }

            store.set({
              id,
              data: {
                title: cleanTitle(safeString(item.title)),
                link: cleanAndTagUrl(item.link),
                pubDate: new Date(item.pubDate || ""),
                content: safeString(item.contentSnippet || item.content || ""),
                channel: channel.label,
                videoId: videoId,
                thumbnail: thumbnail,
                creatorId: channel.creatorId,
              },
            });
          });
        } catch (e) {
          logger.error(`Failed to load YouTube channel ${channel.label}: ${e}`);
        }
      }
    },
  };
}
