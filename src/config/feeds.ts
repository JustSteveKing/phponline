import type { Feed } from "@/types";

// src/config/feeds.ts
export const PHP_FEEDS: Feed[] = [
  {
    id: "laravel-news",
    url: "https://feed.laravel-news.com",
    label: "News",
    type: "news",
  },
  {
    id: "php-net",
    url: "https://www.php.net/feed.atom",
    label: "Official",
    type: "news",
  },
  {
    id: "php-arch",
    url: "https://www.phparch.com/feed/",
    label: "Podcast",
    type: "podcast",
  },
  {
    id: "php-rfcs",
    url: "https://externals.io/rss-rfc",
    label: "RFC",
    type: "rfc",
  },
  //   { id: 'symfony', url: 'https://symfony.com/blog/feed', label: 'Framework' },
  //   { id: 'php-architect', url: 'https://www.php-architect.com/feed/', label: 'Podcast' },
];
