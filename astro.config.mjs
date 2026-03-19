// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  image: {
      // Allows Astro to optimize images from these specific hosts
      remotePatterns: [
      { protocol: 'https', hostname: 'feed.laravel-news.com' },
      { protocol: 'https', hostname: '**.symfony.com' },
      { protocol: 'https', hostname: '**.php.net' },
      { protocol: 'https', hostname: '**.gravatar.com' }, // Good for author avatars
      ],
  },

  site: 'https://www.phponline.dev',

  vite: {
      plugins: [tailwindcss()],
      ssr: {
          external: ['/pagefind/pagefind.js']
      },
      optimizeDeps: {
          exclude: ['/pagefind/pagefind.js']
      },
      build: {
          rollupOptions: {
              external: ['/pagefind/pagefind.js']
          }
      }
  },

  integrations: [svelte()]
});