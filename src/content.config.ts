import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

/**
 * Everything is read from disk. Feeds are fetched by scripts/ingest.ts, which
 * writes what it finds into src/content, so the site is an archive rather than
 * a mirror of whatever each feed happens to be carrying today.
 *
 * The id inside each file is the site's URL for that item. It was derived from
 * the feed when the item was first seen and must never change, so the loaders
 * below read it back rather than deriving one from the filename.
 */
const byStoredId = ({ data }: { data: Record<string, unknown> }) => data.id as string;

export const collections = {
  creators: defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/creators" }),
    schema: z.object({
      name: z.string(),
      description: z.string(),
      avatar: z.string().url(),
      website: z.string().url().optional(),
      twitter: z.string().optional(),
      sources: z.object({
        feeds: z
          .array(
            z.object({
              url: z.string().url(),
              label: z.string(),
              type: z.enum(["news", "community", "internals", "rfc"]),
            }),
          )
          .optional(),
        podcasts: z
          .array(
            z.object({
              feed: z.string().url(),
              title: z.string(),
              href: z.string().url(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        youtube: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
      }),
    }),
  }),
  events: defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/events" }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      location: z.string(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      url: z.string().url(),
      type: z.enum(["conference", "meetup", "workshop"]),
      creatorId: z.string().optional(),
    }),
  }),
  versions: defineCollection({
    loader: file("src/content/versions.json"),
    schema: z.object({
      id: z.string(),
      version: z.string(),
      status: z.enum(["active", "security", "eol"]),
      initialRelease: z.string(),
      activeUntil: z.string(),
      securityUntil: z.string(),
    }),
  }),
  news: defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/news", generateId: byStoredId }),
    schema: z.object({
      id: z.string(),
      title: z.string(),
      link: z.string().url(),
      pubDate: z.coerce.date(),
      coverImage: z.string().url().optional(),
      content: z.string().optional(),
      source: z.string(),
      author: z.string().optional(),
      status: z.string().optional(),
      creatorId: z.string().optional(),
      tags: z.array(z.string()).default([]),
    }),
  }),
  episodes: defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/episodes", generateId: byStoredId }),
    schema: z.object({
      id: z.string(),
      title: z.string(),
      link: z.string().url().optional(),
      pubDate: z.coerce.date(),
      content: z.string().optional(),
      coverImage: z.string().url().optional(),
      podcast: z.string(),
      audioUrl: z.string().url().optional(),
      duration: z.string().optional(),
      episode: z.string().optional(),
      season: z.string().optional(),
      creatorId: z.string().optional(),
    }),
  }),
  videos: defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/videos", generateId: byStoredId }),
    schema: z.object({
      id: z.string(),
      title: z.string(),
      link: z.string().url(),
      pubDate: z.coerce.date(),
      content: z.string().optional(),
      channel: z.string(),
      videoId: z.string(),
      thumbnail: z.string().url(),
      creatorId: z.string().optional(),
    }),
  }),
};
