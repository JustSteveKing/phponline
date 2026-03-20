import type { Creator } from "@/types";

export const CREATORS: Creator[] = [
  {
    id: "laravel",
    name: "Laravel",
    description:
      "The PHP Framework for Web Artisans. Created by Taylor Otwell.",
    avatar: "https://github.com/laravel.png",
    website: "https://laravel.com",
    twitter: "laravelphp",
    sources: {
      feeds: [
        { url: "https://laravel.com/feed", label: "laravel", type: "news" },
      ],
      youtube: [{ id: "UCfO2GiQwb-cwJTb1CuRSkwg", label: "Laravel" }],
    },
  },
  {
    id: "laravel-news",
    name: "Laravel News",
    description:
      "The official blog of the Laravel ecosystem, covering releases, tutorials, and community events.",
    avatar: "https://github.com/laravelnews.png",
    website: "https://laravel-news.com",
    twitter: "laravelnews",
    sources: {
      feeds: [
        {
          url: "https://feed.laravel-news.com",
          label: "laravel-news",
          type: "news",
        },
      ],
      podcasts: [
        {
          feed: "https://feeds.transistor.fm/laravelnews",
          title: "Laravel News Podcast",
          href: "https://podcast.laravel-news.com/",
          badge: "Weekly Show",
        },
      ],
    },
  },
  {
    id: "spatie",
    name: "Spatie",
    description:
      "A digital agency from Belgium that has released hundreds of open-source PHP and Laravel packages.",
    avatar: "https://github.com/spatie.png",
    website: "https://spatie.be",
    twitter: "spatie_be",
    sources: {
      feeds: [
        {
          url: "https://spatie.be/feeds/blog",
          label: "spatie",
          type: "community",
        },
      ],
      youtube: [{ id: "UCoBbei3S9JLTcS2VeEOWDeQ", label: "Spatie" }],
    },
  },
  {
    id: "symfony",
    name: "Symfony",
    description:
      "A set of reusable PHP components and a PHP framework for web projects. Created by Fabien Potencier.",
    avatar: "https://github.com/symfony.png",
    website: "https://symfony.com",
    twitter: "symfony",
    sources: {
      feeds: [
        {
          url: "https://feeds.feedburner.com/symfony/blog",
          label: "Symfony",
          type: "news",
        },
      ],
      youtube: [{ id: "UCLdVmxwj9dQqM8tJJp2LYGw", label: "Symfony" }],
    },
  },
  {
    id: "aaron-francis",
    name: "Aaron Francis",
    description:
      "Full-stack developer, creator of Sidecar, and database enthusiast. Co-founder of TryGhost.",
    avatar: "https://github.com/aarondfrancis.png",
    website: "https://aaronfrancis.com",
    twitter: "aarondfrancis",
    sources: {
      youtube: [{ id: "UCbixkBITOOa2XNviJLxMh2w", label: "Aaron Francis" }],
    },
  },
  {
    id: "christoph-rumpel",
    name: "Christoph Rumpel",
    description:
      "Full-stack developer from Vienna, Austria. Author of Laravel Core Adventures.",
    avatar: "https://github.com/christophrumpel.png",
    website: "https://christoph-rumpel.com",
    twitter: "christophrumpel",
    sources: {
      youtube: [{ id: "UCdtd5QYBx9MUVXHm7qgEpxA", label: "Christoph Rumpel" }],
    },
  },
  {
    id: "povilas-korop",
    name: "Povilas Korop",
    description:
      "Creator of Laravel Daily, providing daily tips and tutorials for Laravel developers.",
    avatar: "https://github.com/PovilasKorop.png",
    website: "https://laraveldaily.com",
    twitter: "PovilasKorop",
    sources: {
      youtube: [{ id: "UCTuplgOBi6tJIlesIboymGA", label: "Laravel Daily" }],
    },
  },
  {
    id: "the-php-foundation",
    name: "The PHP Foundation",
    description:
      "A non-profit organization focused on ensuring the long-term prosperity of the PHP language.",
    avatar: "https://github.com/php-foundation.png",
    website: "https://thephp.foundation",
    twitter: "ThePHPFoundation",
    sources: {
      feeds: [
        {
          url: "https://thephp.foundation/atom.xml",
          label: "foundation",
          type: "internals",
        },
      ],
    },
  },
  {
    id: "php-net",
    name: "PHP.net",
    description: "The official home of the PHP programming language.",
    avatar: "https://github.com/php.png",
    website: "https://www.php.net",
    sources: {
      feeds: [
        { url: "https://www.php.net/feed.atom", label: "php", type: "news" },
      ],
    },
  },
  {
    id: "internals",
    name: "PHP Internals",
    description:
      "The core development discussions and RFCs for the PHP language.",
    avatar: "https://externals.io/assets/images/logo.svg",
    website: "https://externals.io",
    sources: {
      feeds: [
        { url: "https://externals.io/rss-rfc", label: "rfc", type: "rfc" },
      ],
    },
  },
  {
    id: "juststeveking",
    name: "JustSteveKing",
    description:
      "Technical writer, developer, and speaker focusing on Laravel and PHP architecture.",
    avatar: "https://github.com/juststeveking.png",
    website: "https://www.juststeveking.com",
    twitter: "JustSteveKing",
    sources: {
      feeds: [
        {
          url: "https://www.juststeveking.com/rss.xml",
          label: "juststeveking",
          type: "community",
        },
      ],
      youtube: [{ id: "UCBnj7HfncAygGeyymgydZxQ", label: "JustSteveKing" }],
    },
  },
  {
    id: "laracasts",
    name: "Laracasts",
    description:
      "The ultimate learning resource for PHP and Laravel developers.",
    avatar: "https://github.com/laracasts.png",
    website: "https://laracasts.com",
    twitter: "laracasts",
    sources: {
      podcasts: [
        {
          feed: "https://laracasts.com/feed",
          title: "Laracasts",
          href: "https://laracasts.com/series/the-laracasts-snippet",
          badge: "Weekly Show",
        },
      ],
      youtube: [{ id: "UC3s5g0_lyZYOu8Jjo27udAQ", label: "Laracasts" }],
    },
  },
  {
    id: "northmeetsouth",
    name: "NorthMeetSouth",
    description:
      "A show about the PHP community, parenting, and everything in between.",
    avatar: "https://www.northmeetssouth.audio/assets/img/logo.png",
    website: "https://www.northmeetssouth.audio",
    sources: {
      podcasts: [
        {
          feed: "https://feeds.transistor.fm/north-meets-south-web-podcast",
          title: "NorthMeetSouth",
          href: "https://northmeetsouth.audio/",
          badge: "Casual Chat",
        },
      ],
    },
  },
  {
    id: "php-internals-news",
    name: "PHP Internals News",
    description:
      "A podcast about what's happening in PHP internals, hosted by Derick Rethans.",
    avatar: "https://phpinternals.news/images/logo.png",
    website: "https://phpinternals.news",
    sources: {
      feeds: [
        {
          url: "https://phpinternals.news/feed.rss",
          label: "internals",
          type: "news",
        },
      ],
    },
  },
];
