import type { Feed, Podcast, YouTubeChannel } from "@/types";
import { CREATORS } from "./creators";

// Derived lists from the central CREATORS config
export const PHP_FEEDS: Feed[] = CREATORS.flatMap((creator) =>
  (creator.sources.feeds || []).map((feed) => ({
    ...feed,
    id: `${creator.id}-${feed.label}`,
    creatorId: creator.id,
  })),
);

export const PODCAST_FEEDS: Podcast[] = CREATORS.flatMap((creator) =>
  (creator.sources.podcasts || []).map((podcast) => ({
    ...podcast,
    creatorId: creator.id,
  })),
);

export const YOUTUBE_CHANNELS: YouTubeChannel[] = CREATORS.flatMap((creator) =>
  (creator.sources.youtube || []).map((yt) => ({
    ...yt,
    avatar: creator.avatar,
    creatorId: creator.id,
  })),
);
