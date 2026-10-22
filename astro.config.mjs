// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://mascaradelgrito.co',
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    preact({
      include: ['**/islas/*'],
    }),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
