import fs from "node:fs";
import path from "node:path";
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
          "radial-gradient(circle at top right, #e53e3e33, transparent), radial-gradient(circle at bottom left, #e53e3e11, transparent)",
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
                    backgroundColor: "#e53e3e",
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
              { type: "div", props: { style: { width: "40px", height: "2px", backgroundColor: "#e53e3e" } } },
              {
                type: "div",
                props: {
                  style: { color: "#e53e3e", fontSize: "20px", fontWeight: "bold" },
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
        const root = process.cwd();
        const outDir = path.join(fileURLToPath(dir), "og");

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

        let written = 0;

        for (const card of all) {
          if (!card.id || !card.title) continue;

          const target = path.join(outDir, `${card.id}.png`);
          fs.mkdirSync(path.dirname(target), { recursive: true });

          const svg = await satori(template(card.title, card.source ?? "phponline.dev") as any, {
            width: WIDTH,
            height: HEIGHT,
            fonts: [{ name: "Inter", data: fontData, weight: 400, style: "normal" }],
          });

          fs.writeFileSync(target, new Resvg(svg).render().asPng());
          written++;
        }

        logger.info(`Generated ${written} Open Graph images`);
      },
    },
  };
}
