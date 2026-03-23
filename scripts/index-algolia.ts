import { algoliasearch } from "algoliasearch";
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import { slugify } from "../src/utils/slugify";
import { cleanTitle } from "../src/utils/cleanTitle";
import { extractTags } from "../src/utils/extractTags";
import { extractImageFromHtml } from "../src/utils/extractImage";

// Algolia Setup
const APP_ID = process.env.PUBLIC_ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_WRITE_API_KEY;
const INDEX_NAME = "phponline_content";

if (!APP_ID || !API_KEY) {
    console.error("❌ Missing Algolia environment variables (PUBLIC_ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY)");
    process.exit(1);
}

const client = algoliasearch(APP_ID, API_KEY);
const parser = new Parser();

async function getCreators() {
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

async function getEvents() {
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
  const creators = await getCreators();
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
  const events = await getEvents();
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

  // 3. Index News Feeds
  for (const creator of creators) {
    const feeds = creator.sources?.feeds || [];
    for (const feed of feeds) {
      try {
        console.log(`📡 Fetching news: ${feed.label} from ${creator.name}...`);
        const data = await parser.parseURL(feed.url);
        data.items.forEach((item) => {
          const title = cleanTitle(item.title);
          const content = item.content || item.contentSnippet || "";
          const tags = extractTags(item.title || "", content);

          // Generate unique ID (Match rss.ts)
          let pathSlug = slugify(title);
          try {
            const urlObj = new URL(item.link || "");
            pathSlug = urlObj.pathname.split("/").filter(Boolean).join("-");
          } catch (e) {}

          records.push({
            objectID: `news-${slugify(feed.label)}-${pathSlug}`,
            type: "news",
            title: title,
            description: content
              .replace(/<\/?[^>]+(>|$)/g, "")
              .substring(0, 200),
            source: feed.label,
            url: `/news/${slugify(feed.label)}/${pathSlug}`,
            image: item.enclosure?.url || extractImageFromHtml(content),
            pubDate: item.pubDate
              ? new Date(item.pubDate).getTime()
              : Date.now(),
            tags: ["news", ...tags],
          });
        });
      } catch (e) {
        console.error(`❌ Failed feed ${feed.url}:`, e);
      }
    }

    // 4. Index Podcasts
    const podcasts = creator.sources?.podcasts || [];
    for (const podcast of podcasts) {
      try {
        console.log(`🎙️ Fetching podcast: ${podcast.title}...`);
        const data = await parser.parseURL(podcast.feed);
        data.items.forEach((item) => {
          const title = cleanTitle(item.title);
          const podcastSlug = slugify(podcast.title);
          const episodeSlug = slugify(title);

          records.push({
            objectID: `podcast-${podcastSlug}-${episodeSlug}`,
            type: "podcast",
            title: title,
            description: (item as any).summary || item.contentSnippet || "",
            source: podcast.title,
            url: `/podcasts/${podcastSlug}`,
            image: item.itunes?.image || item.enclosure?.url,
            pubDate: item.pubDate
              ? new Date(item.pubDate).getTime()
              : Date.now(),
            tags: ["podcast"],
          });
        });
      } catch (e) {
        console.error(`❌ Failed podcast ${podcast.title}:`, e);
      }
    }

    // 5. Index YouTube
    const channels = creator.sources?.youtube || [];
    for (const yt of channels) {
      try {
        console.log(`📺 Fetching YouTube: ${yt.label}...`);
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${yt.id}`;
        const data = await parser.parseURL(feedUrl);
        data.items.forEach((item: any) => {
          const title = cleanTitle(item.title);
          const videoId = item.videoId || item.id?.split(":")?.pop();
          const channelSlug = slugify(yt.label);
          const videoSlug = slugify(title);

          records.push({
            objectID: `video-${videoId}`,
            type: "video",
            title: title,
            description: item.contentSnippet || "",
            source: yt.label,
            url: `/videos/watch/${channelSlug}/${videoSlug}`,
            image: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            pubDate: item.pubDate
              ? new Date(item.pubDate).getTime()
              : Date.now(),
            tags: ["video"],
          });
        });
      } catch (e) {
        console.error(`❌ Failed YouTube ${yt.label}:`, e);
      }
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
