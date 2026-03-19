import Parser from "rss-parser";
import type { Loader } from "astro:loaders";
import { load as loadCheerio } from "cheerio";
import type { PHP_FEEDS } from "@/config/feeds";
import { extractImageFromHtml } from "@/utils/extractImage";

const parser = new Parser();

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
}

export function phpCommunityLoader(feedUrls: typeof PHP_FEEDS): Loader {
  return {
    name: "php-community-loader",
    load: async ({ store, logger }) => {
      logger.info("Fetching PHP community feeds...");
      
      store.clear();

      for (const feed of feedUrls) {
        try {
          const data = await parser.parseURL(feed.url);

          data.items.forEach((item) => {
            let id = "";
            try {
                // Handle potentially relative or malformed links
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
                // Fallback ID if URL parsing fails
                id = `${slugify(feed.label)}/${slugify(item.title || 'article')}`;
            }

            let content = item.content || item.contentSnippet || item.description || "";
            const coverImage = item.enclosure?.url || extractImageFromHtml(content);

            // Strip images from content
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
                // Leave content as is if parsing fails
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
                // Extract status from title if it's an RFC
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
