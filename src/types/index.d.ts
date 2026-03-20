export interface Feed {
  id: string;
  url: string;
  label: string;
  type: string;
}

export interface Podcast {
  title: string;
  description: string;
  href: string;
  badge: string;
  feed: string;
}

export interface YouTubeChannel {
  id: string;
  label: string;
}
