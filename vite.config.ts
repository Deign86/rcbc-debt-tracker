import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      // Use the manifest.json file from public/ to avoid conflicts
      manifest: false,
      devOptions: {
        enabled: true, // Enable in dev mode for testing
        type: 'module',
      },
      workbox: {
        // Offline fallback support
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/auth/],
        
        // Glob patterns for precaching
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        
        // Cache strategies
        runtimeCaching: [
          // Firestore API - NetworkFirst with long cache
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10, // Fallback to cache after 10s
            },
          },
          // Firebase Storage - NetworkFirst
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              networkTimeoutSeconds: 10,
            },
          },
          // Firebase Auth - NetworkOnly (don't cache auth requests)
          {
            urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          // Firebase general - NetworkFirst
          {
            urlPattern: /^https:\/\/.*\.firebaseapp\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              networkTimeoutSeconds: 10,
            },
          },
          // Google Fonts - CacheFirst with long expiry
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          // Images - CacheFirst with long expiry
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // JS/CSS - StaleWhileRevalidate for app assets
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
        // Clean up outdated caches
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  build: {
    // Enable asset inlining for better caching
    assetsInlineLimit: 4096,
    // Generate source maps for better debugging
    sourcemap: false,
    // Optimize chunks for better caching
    rollupOptions: {
      output: {
        // Manual chunks for better long-term caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'date-vendor': ['date-fns'],
        },
        // Add hash to filenames for cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Minification - keep console.warn and console.error for debugging
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: ['log'],
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },
  },
})
