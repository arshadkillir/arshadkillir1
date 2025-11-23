import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // This strategy prioritizes serving assets from the cache,
        // making the app load faster and work better offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [{
          handler: 'CacheFirst',
          urlPattern: ({ request }) => request.destination === 'image',
        }]
      },
      includeAssets: ['logo.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Nandeyal POS',
        short_name: 'NPOS',
        description: 'A modern Point of Sale application.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo.png', // It's best to create a 192x192 version
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo.png', // It's best to create a 512x512 version
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});