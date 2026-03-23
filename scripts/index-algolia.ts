import { algoliasearch } from "algoliasearch";
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import { slugify } from "../src/utils/slugify";
import { cleanTitle } from "../src/utils/cleanTitle";
import { extractTags } from "../src/utils/extractTags";
import { extractImageFromHtml } from "../src/utils/extractImage";
import { cleanAndTagUrl } from "../src/utils/cleanAndTagUrl";
import { PHP_FEEDS, PODCAST_FEEDS, YOUTUBE_CHANNELS } from "../src/config/feeds";

// Algolia Setup
const APP_ID = process.env.PUBLIC_ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_WRITE_API_KEY;
const INDEX_NAME = "phponline_content";

if (!APP_ID || !API_KEY) {
    console.error("❌ Missing Algolia environment variables (PUBLIC_ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY)");
    process.exit(1);
}

const client = algoliasearch(APP_ID, API_KEY);
const parser = new Parser({
    customFields: {
        item: [
            ['itunes:duration', 'duration'],
            ['itunes:episode', 'episode'],
            ['itunes:season', 'season'],
            ['itunes:summary', 'summary'],
            ['yt:videoId', 'videoId'],
            ['media:group', 'mediaGroup'],
        ],
    },
});

function getCreatorsRaw() {
  const creatorsDir = path.resolve("./src/content/creators");
  if (!fs.existsSync(creatorsDir)) return [];

  return fs
    .readdirSync(creatorsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const content = fs.readFileSync(path.join(creatorsDir, file), "utf-8");
      return {
        id: file.replace(".json", ""),
        ...JSON.parse(content),
      };
    });
}

function getEventsRaw() {
  const eventsDir = path.resolve("./src/content/events");
  if (!fs.existsSync(eventsDir)) return [];

  return fs
    .readdirSync(eventsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const content = fs.readFileSync(path.join(eventsDir, file), "utf-8");
      return {
        id: file.replace(".json", ""),
        ...JSON.parse(content),
      };
    });
}

async function run() {
  console.log("🚀 Starting Algolia Indexing...");
  const records: any[] = [];

  // 1. Index Creators
  const creators = getCreatorsRaw();
  creators.forEach((creator) => {
    records.push({
      objectID: `creator-${creator.id}`,
      type: "creator",
      title: creator.name,
      description: creator.description,
      image: creator.avatar,
      url: `/creators/${creator.id}`,
      tags: ["creator"],
    });
  });

  // 2. Index Events
  const events = getEventsRaw();
  events.forEach((event) => {
    records.push({
      objectID: `event-${event.id}`,
      type: "event",
      title: event.title,
      description: event.description,
      location: event.location,
      url: "/events",
      tags: ["event", event.type],
    });
  });

  // 3. Index PHP Community Feeds (News)
  for (const feed of PHP_FEEDS) {
    try {
      console.log(`📡 Fetching news: ${feed.label}...`);
      const data = await parser.parseURL(feed.url);
      data.items.forEach((item) => {
        const title = cleanTitle(item.title) || "";
        let content = item.content || item.contentSnippet || (item as any).summary || "";
        const tags = extractTags(title, content);

        // Generate ID (Match rss.ts)
        let id = "";
        try {
            const baseUrl = feed.url.startsWith('http') ? new URL(feed.url).origin : "https://phponline.dev";
            const urlObj = new URL(item.link || "", baseUrl);
            let pathSlug = urlObj.pathname.split('/').filter(Boolean).join('-');
            if (!pathSlug || pathSlug.includes('index.php')) {
                if (urlObj.hash) pathSlug = urlObj.hash.replace('#', '');
                else pathSlug = slugify(title || 'article');
            }
            pathSlug = pathSlug.replace(/[\[\]\(\)]/g, '');
            const sourceSlug = slugify(feed.label);
            id = `${sourceSlug}/${pathSlug}`;
        } catch (e) {
            id = `${slugify(feed.label)}/${slugify(title || 'article')}`;
        }

        records.push({
          objectID: `news-${id}`,
          type: "news",
          title: title,
          description: content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 200),
          source: feed.label,
          url: cleanAndTagUrl(item.link),
          image: item.enclosure?.url || extractImageFromHtml(content),
          pubDate: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
          tags: ["news", ...tags],
          creatorId: feed.creatorId,
        });
      });
    } catch (e) {
      console.error(`❌ Failed feed ${feed.url}:`, e);
    }
  }

  // 4. Index Podcasts
  for (const podcast of PODCAST_FEEDS) {
    try {
      console.log(`🎙️ Fetching podcast: ${podcast.title}...`);
      const data = await parser.parseURL(podcast.feed);
      data.items.forEach((item) => {
        const title = cleanTitle(item.title) || "";
        const episodeSlug = slugify(title || 'episode');
        const podcastSlug = slugify(podcast.title);
        const id = `${podcastSlug}/${episodeSlug}`;

        records.push({
          objectID: `podcast-${id}`,
          type: "podcast",
          title: title,
          description: (item as any).summary || item.contentSnippet || item.content || "",
          source: podcast.title,
          url: cleanAndTagUrl(item.link),
          image: item.itunes?.image || item.enclosure?.url,
          pubDate: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
          tags: ["podcast"],
          creatorId: podcast.creatorId,
        });
      });
    } catch (e) {
      console.error(`❌ Failed podcast ${podcast.title}:`, e);
    }
  }

  // 5. Index YouTube
  for (const channel of YOUTUBE_CHANNELS) {
    try {
      console.log(`📺 Fetching YouTube: ${channel.label}...`);
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
      const data = await parser.parseURL(feedUrl);
      data.items.forEach((item: any) => {
        const title = cleanTitle(item.title) || "";
        const videoId = item.videoId || item.id?.split(':')?.pop();
        const channelSlug = slugify(channel.label);
        const videoSlug = slugify(title || 'video');
        const id = `${channelSlug}/${videoSlug}`;

        let thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        if (item.mediaGroup && item.mediaGroup['media:thumbnail']) {
            thumbnail = item.mediaGroup['media:thumbnail'][0].$.url;
        }

        records.push({
          objectID: `video-${videoId}`,
          type: "video",
          title: title,
          description: item.contentSnippet || item.content || "",
          source: channel.label,
          url: cleanAndTagUrl(item.link),
          image: thumbnail,
          pubDate: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
          tags: ["video"],
          creatorId: channel.creatorId,
        });
      });
    } catch (e) {
      console.error(`❌ Failed YouTube channel ${channel.label}:`, e);
    }
  }

  console.log(`📤 Pushing ${records.length} records to Algolia...`);

  try {
    await client.saveObjects({
      indexName: INDEX_NAME,
      objects: records,
    });
    console.log("✅ Algolia Indexing Complete!");
  } catch (error) {
    console.error("❌ Algolia Error:", error);
    process.exit(1);
  }
}

run();
