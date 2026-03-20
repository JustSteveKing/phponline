import type { Feed, Podcast, YouTubeChannel } from "@/types";
import { getCollection } from "astro:content";

// We'll use a top-level await to fetch the creators from the content collection
// This works in Astro config files and layouts/pages
const creators = await getCollection("creators");

export const PHP_FEEDS: Feed[] = creators.flatMap((creator) =>
  (creator.data.sources.feeds || []).map((feed) => ({
    ...feed,
    id: `${creator.id}-${feed.label}`,
    creatorId: creator.id,
  })),
);

export const PODCAST_FEEDS: Podcast[] = creators.flatMap((creator) =>
  (creator.data.sources.podcasts || []).map((podcast) => ({
    ...podcast,
    creatorId: creator.id,
  })),
);

export const YOUTUBE_CHANNELS: YouTubeChannel[] = creators.flatMap((creator) =>
  (creator.data.sources.youtube || []).map((yt) => ({
    ...yt,
    avatar: creator.data.avatar,
    creatorId: creator.id,
  })),
);
