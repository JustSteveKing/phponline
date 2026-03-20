import { defineCollection } from "astro:content";
import { z } from "zod";
import { phpCommunityLoader, phpPodcastLoader, phpYouTubeLoader } from "@/loaders/rss";
import { PHP_FEEDS, PODCAST_FEEDS, YOUTUBE_CHANNELS } from "@/config/feeds";

export const collections = {
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
