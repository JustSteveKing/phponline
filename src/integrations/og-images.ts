import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { AstroIntegration } from "astro";
import { slugify } from "../utils/slugify";
import { PODCAST_FEEDS, YOUTUBE_CHANNELS } from "../config/feeds";

/**
 * Render the Open Graph image for every page, into the build output.
 *
 * These used to be written into public/ and committed: 2,622 PNGs and 270MB
 * of a 516MB repository, growing every three hours forever, for files that
 * are derived from content the repository already holds. They are build
 * output, so they are built.
 *
 * It is an integration rather than a script so that it happens wherever the
 * site is built, including on Cloudflare, without depending on anybody having
 * configured the right build command.
 *
 * It also reads the content files rather than fetching the feeds. The old
 * script re-derived ids from RSS with its own copy of the loader's logic,
 * which is a third place the same derivation lived and a third place it could
 * drift. The ids are written down now, so it reads them.
 */

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Where rendered images are kept between builds.
 *
 * This exact path is the point. Cloudflare Workers Builds cannot cache
 * arbitrary directories: it caches the package manager store plus one known
 * path per framework, and for Astro that path is node_modules/.astro. Putting
 * the cache anywhere else, dist included, means it is thrown away between
 * builds and every image is rendered again.
 *
 * So a warm build copies and a cold build renders. A full cold render is
 * about five minutes here and roughly thirteen on Cloudflare's two-core
 * builder, which fits inside their timeout today. It will not fit forever, at
 * twenty new items a day. The answer then is rendering at request time on a
 * Worker, not dropping images for older articles: people link to the archive,
 * and that is the whole point of having one.
 */
const CACHE_DIR = path.join("node_modules", ".astro", "og");

/**
 * Bump to invalidate every cached image at once.
 *
 * The cache key is the content of a card, so a changed headline re-renders on
 * its own. It cannot see a change to the template below, which is what this
 * is for.
 */
const TEMPLATE_VERSION = "2";

const STATIC_PAGES = [
  { id: "home", title: "The PHP Community Pulse", source: "Home" },
  { id: "archive", title: "Community Archive", source: "Resources" },
  { id: "rfcs", title: "RFC Tracker", source: "Core Dev" },
  { id: "events", title: "Upcoming Events", source: "Calendar" },
  { id: "podcasts", title: "Community Podcasts", source: "Audio" },
  { id: "videos", title: "Community Videos", source: "Video" },
  { id: "creators", title: "Community Creators", source: "Directory" },
  { id: "about", title: "About the Project", source: "Project" },
];

type Card = { id: string; title: string; source: string };

function template(title: string, source: string) {
  return {
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        backgroundImage:
          "radial-gradient(circle at top right, #6a5da833, transparent), radial-gradient(circle at bottom left, #6a5da811, transparent)",
        padding: "80px",
        fontFamily: "Inter",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    backgroundColor: "#6a5da8",
                    padding: "8px 16px",
                    borderRadius: "100px",
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  },
                  children: source,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    color: "#94a3b8",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  },
                  children: "phponline.dev",
                },
              },
            ],
          },
        },
        {
          type: "h1",
          props: {
            style: {
              fontSize: "64px",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.1,
              marginBottom: "20px",
              display: "flex",
            },
            children: title,
          },
        },
        {
          type: "div",
          props: {
            style: { marginTop: "auto", display: "flex", alignItems: "center", gap: "12px" },
            children: [
              { type: "div", props: { style: { width: "40px", height: "2px", backgroundColor: "#9c92cf" } } },
              {
                type: "div",
                props: {
                  style: { color: "#9c92cf", fontSize: "20px", fontWeight: "bold" },
                  children: "The pulse of the PHP ecosystem",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/** Every item that has a page, read from the files the build reads. */
function cards(root: string): Card[] {
  const out: Card[] = [...STATIC_PAGES];

  const news = path.join(root, "src", "content", "news");
  if (fs.existsSync(news)) {
    for (const file of fs.readdirSync(news, { recursive: true, encoding: "utf8" })) {
      if (!file.endsWith(".json")) continue;

      const item = JSON.parse(fs.readFileSync(path.join(news, file), "utf8"));
      out.push({ id: item.id, title: item.title, source: item.source });
    }
  }

  const creators = path.join(root, "src", "content", "creators");
  if (fs.existsSync(creators)) {
    for (const file of fs.readdirSync(creators)) {
      if (!file.endsWith(".json")) continue;

      const creator = JSON.parse(fs.readFileSync(path.join(creators, file), "utf8"));
      out.push({ id: `creators/${file.replace(/\.json$/, "")}`, title: creator.name, source: "Creator" });
    }
  }

  return out;
}

export default function ogImages(): AstroIntegration {
  return {
    name: "og-images",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        // Rendering 1,823 images takes five minutes, which is fine on a
        // deploy and intolerable when you are changing a colour. Anything
        // that only needs the HTML can skip them.
        if (process.env.SKIP_OG) {
          logger.info("SKIP_OG set, not rendering Open Graph images");
          return;
        }

        const root = process.cwd();
        const outDir = path.join(fileURLToPath(dir), "og");
        const cacheDir = path.join(root, CACHE_DIR);

        fs.mkdirSync(cacheDir, { recursive: true });

        // Imported at the top rather than here: by astro:build:done Vite's
        // module runner is closed, and a dynamic import throws.
        const all: Card[] = [
          ...cards(root),
          ...PODCAST_FEEDS.map((p: any) => ({
            id: `podcasts/${slugify(p.title)}`,
            title: p.title,
            source: "Podcast",
          })),
          ...YOUTUBE_CHANNELS.map((c: any) => ({
            id: `videos/${slugify(c.label)}`,
            title: c.label,
            source: "YouTube",
          })),
        ];

        // Vendored rather than fetched. A CDN request here would make every
        // build, including Cloudflare's, depend on jsdelivr being up.
        const fontData = fs.readFileSync(
          path.join(root, "src", "assets", "fonts", "inter-latin-900-normal.woff"),
        );

        let rendered = 0;
        let reused = 0;
        const live = new Set<string>();

        for (const card of all) {
          if (!card.id || !card.title) continue;

          const source = card.source ?? "phponline.dev";

          // Keyed on what the image shows rather than on the id, so an item
          // whose headline changes gets a new image instead of keeping a
          // stale one for ever.
          const key = createHash("sha256")
            .update(`${TEMPLATE_VERSION}\u0000${card.title}\u0000${source}`)
            .digest("hex");

          const cached = path.join(cacheDir, `${key}.png`);
          live.add(`${key}.png`);

          if (!fs.existsSync(cached)) {
            const svg = await satori(template(card.title, source) as any, {
              width: WIDTH,
              height: HEIGHT,
              fonts: [{ name: "Inter", data: fontData, weight: 400, style: "normal" }],
            });

            fs.writeFileSync(cached, new Resvg(svg).render().asPng());
            rendered++;
          } else {
            reused++;
          }

          const target = path.join(outDir, `${card.id}.png`);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.copyFileSync(cached, target);
        }

        // Superseded entries, from headlines that changed or a template bump.
        // Without this the cache only grows, and Cloudflare evicts the whole
        // project at 10GB, which would throw away the useful entries too.
        let pruned = 0;
        for (const file of fs.readdirSync(cacheDir)) {
          if (file.endsWith(".png") && !live.has(file)) {
            fs.unlinkSync(path.join(cacheDir, file));
            pruned++;
          }
        }

        logger.info(
          `Open Graph images: ${rendered} rendered, ${reused} reused from cache` +
            (pruned ? `, ${pruned} stale entries pruned` : ""),
        );
      },
    },
  };
}
