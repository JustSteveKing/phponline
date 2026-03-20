import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";
import {
  phpCommunityLoader,
  phpPodcastLoader,
  phpYouTubeLoader,
} from "@/loaders/rss";
import { PHP_FEEDS, PODCAST_FEEDS, YOUTUBE_CHANNELS } from "@/config/feeds";

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
    loader: phpCommunityLoader(PHP_FEEDS),
    schema: z.object({
      title: z.string(),
      link: z.string().url(),
      pubDate: z.date(),
      coverImage: z.string().url().optional(),
      content: z.string().optional(),
      source: z.string(),
      author: z.string().optional(),
      status: z.string().optional(),
      creatorId: z.string().optional(),
    }),
  }),
  episodes: defineCollection({
    loader: phpPodcastLoader(PODCAST_FEEDS),
    schema: z.object({
      title: z.string(),
      link: z.string().url().optional(),
      pubDate: z.date(),
      content: z.string().optional(),
      podcast: z.string(),
      audioUrl: z.string().url().optional(),
      duration: z.string().optional(),
      episode: z.string().optional(),
      season: z.string().optional(),
      creatorId: z.string().optional(),
    }),
  }),
  videos: defineCollection({
    loader: phpYouTubeLoader(YOUTUBE_CHANNELS),
    schema: z.object({
      title: z.string(),
      link: z.string().url(),
      pubDate: z.date(),
      content: z.string().optional(),
      channel: z.string(),
      videoId: z.string(),
      thumbnail: z.string().url(),
      creatorId: z.string().optional(),
    }),
  }),
};
