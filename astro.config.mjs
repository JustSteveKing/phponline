// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      PUBLIC_ALGOLIA_APP_ID: envField.string({ context: "client", access: "public" }),
      PUBLIC_ALGOLIA_SEARCH_KEY: envField.string({ context: "client", access: "public" }),
      ALGOLIA_WRITE_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
  image: {
    // Allows Astro to optimize images from these specific hosts
    remotePatterns: [
      { protocol: "https", hostname: "feed.laravel-news.com" },
      { protocol: "https", hostname: "**.symfony.com" },
      { protocol: "https", hostname: "**.php.net" },
      { protocol: "https", hostname: "**.gravatar.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "unavatar.io" },
    ],
  },

  site: "https://phponline.dev",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [svelte(), sitemap()],
});
