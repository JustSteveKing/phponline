import type { Feed } from "@/types";

// src/config/feeds.ts
export const PHP_FEEDS: Feed[] = [
  {
    id: "laravel-news",
    url: "https://feed.laravel-news.com",
    label: "laravel-news",
    type: "news",
  },
  {
    id: "php-net",
    url: "https://www.php.net/feed.atom",
    label: "php",
    type: "news",
  },
  {
    id: "php-rfcs",
    url: "https://externals.io/rss-rfc",
    label: "rfc",
    type: "rfc",
  },
  {
    id: "symfony",
    url: "https://feeds.feedburner.com/symfony/blog",
    label: "Symfony",
    type: "news",
  },
  // { id: 'php-architect', url: 'https://www.php-architect.com/feed/', label: 'PHP-Arch', type: 'news' },
];
