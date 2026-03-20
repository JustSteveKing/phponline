export interface Creator {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  website?: string;
  twitter?: string;
  github?: string;
  sources: {
    feeds?: Array<{ url: string; label: string; type: string }>;
    podcasts?: Array<{ feed: string; title: string; href: string; badge: string }>;
    youtube?: Array<{ id: string; label: string }>;
  };
}

export interface Feed {
  id: string;
  url: string;
  label: string;
  type: string;
  creatorId?: string;
}

export interface Podcast {
  title: string;
  description?: string;
  href: string;
  badge: string;
  feed: string;
  creatorId?: string;
}

export interface YouTubeChannel {
  id: string;
  label: string;
  avatar?: string;
  creatorId?: string;
}
