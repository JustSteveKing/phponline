import type { Feed, Podcast, YouTubeChannel } from "@/types";

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
		description: "Stay up to date with the latest PHP news, releases, and community discussions. Hosted by Eric Van Johnson and John Congdon.",
		href: "https://www.phproundtable.com/",
		badge: "Weekly Show",
        feed: "https://www.phproundtable.com/feed/rss"
	},
	{
		title: "PHP Ugly",
		description: "The casual, often humorous side of the PHP community. Weekly discussions on the industry from a developer's perspective.",
		href: "https://phpugly.com/",
		badge: "Entertainment",
        feed: "https://feeds.simplecast.com/Y_m_S_9v"
	},
	{
		title: "Voices of the Elephant",
		description: "Short, snackable interviews with the most interesting people in the PHP community. A long-running community staple.",
		href: "https://voicesoftheelephant.com/",
		badge: "Interviews",
        feed: "https://voicesoftheelephant.com/feed/"
	},
    {
		title: "The Laravel Podcast",
		description: "The definitive Laravel podcast. Matt Stauffer and friends discuss everything happening in the Laravel ecosystem.",
		href: "https://laravelpodcast.com/",
		badge: "Framework Focus",
        feed: "https://feeds.simplecast.com/8ol9_mU_"
	},
    {
		title: "No Plans to Merge",
		description: "A casual chat about developer life, PHP, and the business of building software. Hosted by Caleb Porzio and Daniel Coulbourne.",
		href: "https://noplanstomerge.com/",
		badge: "Developer Life",
        feed: "https://noplanstomerge.com/feed"
	},
    {
		title: "NorthMeetSouth",
		description: "A show about the PHP community, parenting, and everything in between. Hosted by Jacob Bennett and Michael Dyrynda.",
		href: "https://northmeetsouth.audio/",
		badge: "Casual Chat",
        feed: "https://www.northmeetssouth.audio/feed"
	}
];

export const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  { id: "UC6kwT7ax887830uPVnz0_Lw", label: "Laravel" },
  { id: "UC3s5g0_lyZYOu8Jjo27udAQ", label: "Laracasts" },
  { id: "UC6-JHDgbdeXbnTwc2Lj98g", label: "Aaron Francis" },
  { id: "UCNlUCA4VORBx8X-h-rXvXEg", label: "Laravel Daily" },
  { id: "UCdtd5QYBx9MUVXHm7qgEpxA", label: "Christoph Rumpel" },
  { id: "UCwRNsgqoPSh4pLTRJEPqo2Q", label: "Spatie" },
  { id: "UCMs9GHjzlfmZrfnU-Z3iLwg", label: "Symfony" },
  { id: "UCzQRSSaIV2Ajvl81BxPQDZA", label: "PHP Internals News" },
  { id: "UCb9XEo_1SDNR8Ucpbktrg5A", label: "The PHP Foundation" },
  { id: "UC2KJHARTj6KRpKzLU1sVxBA", label: "Beyond Code" },
];
