// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

const isVercel = Boolean(process.env.VERCEL);

// https://astro.build/config
export default defineConfig({
  site: 'https://mascaradelgrito.co',
  output: 'static',
  adapter: isVercel ? vercel() : node({ mode: 'standalone' }),
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
