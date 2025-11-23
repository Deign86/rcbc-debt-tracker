/**
 * Cache Service - Provides a simple caching layer using localStorage
 * to improve initial load performance on Vercel deployments
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_VERSION = '1.0.0';
const DEFAULT_TTL = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

export class CacheService {
  /**
   * Save data to cache with a timestamp and version
   */
  static set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
      // Silently fail - caching is not critical
    }
  }

  /**
   * Retrieve data from cache if it exists and hasn't expired
   */
  static get<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Check version compatibility
      if (entry.version !== CACHE_VERSION) {
        this.remove(key);
        return null;
      }

      // Check if cache has expired
      const age = Date.now() - entry.timestamp;
      if (age > ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to read from cache:', error);
      return null;
    }
  }

  /**
   * Remove a specific cache entry
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cache entry:', error);
    }
  }

  /**
   * Clear all cache entries with our prefix
   */
  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('rcbc-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Check if a cache entry exists and is valid
   */
  static has(key: string, ttl: number = DEFAULT_TTL): boolean {
    return this.get(key, ttl) !== null;
  }

  /**
   * Get cache statistics for debugging
   */
  static getStats(): { size: number; keys: string[] } {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('rcbc-')
      );
      const size = keys.reduce((acc, key) => {
        const item = localStorage.getItem(key);
        return acc + (item ? item.length : 0);
      }, 0);

      return { size, keys };
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return { size: 0, keys: [] };
    }
  }
}

// Cache key constants
export const CACHE_KEYS = {
  DEBT_STATE: 'rcbc-debt-state',
  PAYMENT_HISTORY: 'rcbc-payment-history',
  PREFERENCES: 'rcbc-preferences',
} as const;
