import Parser from "rss-parser";
import type { Loader } from "astro/loaders";
import type { PHP_FEEDS } from "@/config/feeds";
import { extractImageFromHtml } from "@/utils/extractImage";

const parser = new Parser();

export function phpCommunityLoader(feedUrls: typeof PHP_FEEDS): Loader {
  return {
    name: "php-community-loader",
    load: async ({ store, logger }) => {
      logger.info("Fetching PHP community feeds...");

      for (const feed of feedUrls) {
        try {
          const data = await parser.parseURL(feed.url);

          data.items.forEach((item) => {
            // Generate a unique ID so items don't collide
            const id = Buffer.from(item.link || item.title || "").toString(
              "base64",
            );

            const content = item.content || item.contentSnippet || "";
            const coverImage =
              item.enclosure?.url || extractImageFromHtml(content);

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
