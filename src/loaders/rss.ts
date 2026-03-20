import Parser from "rss-parser";
import type { Loader, LoaderContext } from "astro:loaders";
import { load as loadCheerio } from "cheerio";
import type { PHP_FEEDS, PODCAST_FEEDS, YOUTUBE_CHANNELS } from "@/config/feeds";
import { extractImageFromHtml } from "@/utils/extractImage";
import { slugify } from "@/utils/slugify";

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
                        pathSlug = slugify(item.title || 'article');
                    }
                }
                
                pathSlug = pathSlug.replace(/[\[\]\(\)]/g, '');
                const sourceSlug = slugify(feed.label);
                id = `${sourceSlug}/${pathSlug}`;
            } catch (e) {
                id = `${slugify(feed.label)}/${slugify(item.title || 'article')}`;
            }

            let content = item.content || item.contentSnippet || (item as any).summary || "";
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

            store.set({
              id,
              data: {
                title: item.title,
                link: item.link,
                coverImage: coverImage,
                pubDate: new Date(item.pubDate || ""),
                content: content,
                source: feed.label,
                author: item.creator || data.title,
                status: feed.id === 'php-rfcs' ? (item.title?.match(/\[(.*?)\]/)?.[1] || 'Discussion') : undefined,
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
            const episodeSlug = slugify(item.title || 'episode');
            const podcastSlug = slugify(podcast.title);
            const id = `${podcastSlug}/${episodeSlug}`;

            store.set({
              id,
              data: {
                title: item.title,
                link: item.link,
                pubDate: new Date(item.pubDate || ""),
                content: (item as any).summary || item.contentSnippet || item.content || "",
                podcast: podcast.title,
                audioUrl: item.enclosure?.url,
                duration: (item as any).duration,
                episode: (item as any).episode,
                season: (item as any).season,
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
            const videoSlug = slugify(item.title || 'video');
            const channelSlug = slugify(channel.label);
            const id = `${channelSlug}/${videoSlug}`;

            // Extract thumbnail from mediaGroup if available, otherwise fallback
            let thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
            if (item.mediaGroup && item.mediaGroup['media:thumbnail']) {
                thumbnail = item.mediaGroup['media:thumbnail'][0].$.url;
            }

            store.set({
              id,
              data: {
                title: item.title,
                link: item.link,
                pubDate: new Date(item.pubDate || ""),
                content: item.contentSnippet || item.content || "",
                channel: channel.label,
                videoId: videoId,
                thumbnail: thumbnail,
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
