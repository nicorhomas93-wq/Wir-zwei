import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'flame-heart.png',
        'apple-touch-icon.png',
        'favicon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],
      manifest: {
        name: 'Wir Zwei',
        short_name: 'Wir Zwei',
        description: 'Nur für uns — Erinnerungen, Gedanken, Moodboards.',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
})
