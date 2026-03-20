import type { Feed, Podcast } from "@/types";

// src/config/feeds.ts
export const PHP_FEEDS: Feed[] = [
  // News Feeds
  {
    id: "laravel-news",
    url: "https://feed.laravel-news.com",
    label: "laravel-news",
    type: "news",
  },
  {
    id: "laravel",
    url: "https://laravel.com/feed",
    label: "laravel",
    type: "news",
  },
  {
    id: "php-net",
    url: "https://www.php.net/feed.atom",
    label: "php",
    type: "news",
  },
  {
    id: "symfony",
    url: "https://feeds.feedburner.com/symfony/blog",
    label: "Symfony",
    type: "news",
  },
  // RFCs
  {
    id: "php-rfcs",
    url: "https://externals.io/rss-rfc",
    label: "rfc",
    type: "rfc",
  },
  // Community Feeds
  {
    id: "juststeveking",
    url: "https://www.juststeveking.com/rss.xml",
    label: "juststeveking",
    type: "community",
  },
  {
    id: "stitcher",
    url: "https://stitcher.io/feed/rss",
    label: "stitcher",
    type: "community",
  },
];

export const PODCAST_FEEDS: Podcast[] = [
  {
    title: "The PHP Podcast",
    description:
      "Stay up to date with the latest PHP news, releases, and community discussions. Hosted by Eric Van Johnson and John Congdon.",
    href: "https://www.phproundtable.com/",
    badge: "Weekly Show",
    feed: "https://feeds.simplecast.com/sREPxPje",
  },
  {
    title: "PHP Ugly",
    description:
      "The casual, often humorous side of the PHP community. Weekly discussions on the industry from a developer's perspective.",
    href: "https://phpugly.com/",
    badge: "Entertainment",
    feed: "https://feeds.simplecast.com/iYRiH9ym",
  },
  {
    title: "The Laravel Podcast",
    description:
      "The definitive Laravel podcast. Matt Stauffer and friends discuss everything happening in the Laravel ecosystem.",
    href: "https://laravelpodcast.com/",
    badge: "Framework Focus",
    feed: "https://feeds.transistor.fm/the-laravel-podcast",
  },
  {
    title: "No Plans to Merge",
    description:
      "A casual chat about developer life, PHP, and the business of building software. Hosted by Caleb Porzio and Daniel Coulbourne.",
    href: "https://noplanstomerge.simplecast.com/",
    badge: "Developer Life",
    feed: "https://feeds.simplecast.com/tjCffbY2",
  },
  {
    title: "NorthMeetSouth",
    description:
      "A show about the PHP community, parenting, and everything in between. Hosted by Jacob Bennett and Michael Dyrynda.",
    href: "https://www.northmeetssouth.audio/",
    badge: "Casual Chat",
    feed: "https://feeds.transistor.fm/north-meets-south-web-podcast",
  },
];
