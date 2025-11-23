# Caching Implementation

This branch implements a comprehensive caching system to improve initial load performance on Vercel deployments.

## Changes Implemented

### 1. **LocalStorage Cache Service** (`src/services/cacheService.ts`)
- Created a cache service for storing Firestore data in localStorage
- Implements cache versioning and TTL (time-to-live) management
- Provides utility methods for cache operations (get, set, remove, clearAll)

### 2. **Firestore Persistence** (`src/config/firebase.ts`)
- Enabled IndexedDB persistence for Firestore
- Caches Firestore data locally for instant access on subsequent loads
- Handles errors gracefully (multiple tabs, browser compatibility)

### 3. **Enhanced Firestore Service** (`src/services/firestoreService.ts`)
- Implemented cache-first strategy for `loadDebtState()` and `loadRecentPayments()`
- Returns cached data immediately while fetching fresh data in the background
- Automatically invalidates cache when data is modified (save, delete, reset)
- Cache TTL: 5 minutes for debt state, 10 minutes for payment history

### 4. **Service Worker with Workbox** (`vite.config.ts`)
- Installed `vite-plugin-pwa` and `workbox-build`
- Configured service worker with runtime caching strategies:
  - **NetworkFirst** for Firestore API calls (7-day cache)
  - **CacheFirst** for images (30-day cache)
- Enables automatic PWA manifest generation
- Implements automatic cache cleanup

### 5. **Build Optimizations** (`vite.config.ts`)
- Configured manual code splitting for better long-term caching:
  - `react-vendor`: React, React DOM, React Router
  - `firebase-vendor`: Firebase libraries
  - `date-vendor`: date-fns library
- Added content-based hashing to all assets for cache busting
- Enabled Terser minification with console/debugger removal

## Performance Benefits

1. **First Load Improvements:**
   - Firestore data cached in IndexedDB (instant on subsequent loads)
   - Service worker caches API responses and static assets
   - Code splitting reduces initial bundle size

2. **Return Visit Performance:**
   - LocalStorage cache serves data instantly (no network delay)
   - Background refresh ensures data stays fresh
   - PWA capabilities enable offline functionality

3. **Vercel Deployment Optimizations:**
   - Hashed filenames enable aggressive CDN caching
   - Smaller chunk sizes improve parallel loading
   - Reduced bundle size decreases download time

## Testing Recommendations

1. **Initial Load:** Clear all caches and test first load performance
2. **Return Visit:** Reload the page to verify cached data loads instantly
3. **Offline Mode:** Test offline functionality with service worker
4. **Cache Invalidation:** Make changes and verify fresh data is fetched
5. **Build Size:** Run `npm run build` and check bundle sizes in `dist/`

## Cache Configuration

- **Debt State Cache:** 5 minutes TTL
- **Payment History Cache:** 10 minutes TTL
- **Firestore API Cache:** 7 days
- **Image Cache:** 30 days
- **Cache Version:** 1.0.0 (increment to invalidate all caches)

## Next Steps

1. Monitor real-world performance metrics in Vercel
2. Adjust cache TTLs based on usage patterns
3. Consider implementing cache warming strategies
4. Add cache statistics to preferences page for debugging
