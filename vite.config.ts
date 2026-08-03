import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Enterprise Nursing LMS',
        short_name: 'LMS',
        description: 'Enterprise Learning Management System for Nursing Education',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//, /^\/realtime\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'storage-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-resources', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'image-cache', expiration: { maxEntries: 200, maxAgeSeconds: 604800 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@/components': path.resolve(process.cwd(), 'src/components'),
      '@/config': path.resolve(process.cwd(), 'src/config'),
      '@/constants': path.resolve(process.cwd(), 'src/constants'),
      '@/hooks': path.resolve(process.cwd(), 'src/hooks'),
      '@/layouts': path.resolve(process.cwd(), 'src/layouts'),
      '@/lib': path.resolve(process.cwd(), 'src/lib'),
      '@/pages': path.resolve(process.cwd(), 'src/pages'),
      '@/providers': path.resolve(process.cwd(), 'src/providers'),
      '@/routes': path.resolve(process.cwd(), 'src/routes'),
      '@/store': path.resolve(process.cwd(), 'src/store'),
      '@/styles': path.resolve(process.cwd(), 'src/styles'),
      '@/types': path.resolve(process.cwd(), 'src/types'),
      '@/utils': path.resolve(process.cwd(), 'src/utils'),
    },
  },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
