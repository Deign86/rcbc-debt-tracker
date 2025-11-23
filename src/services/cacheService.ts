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
  private static memoryCache = new Map<string, CacheEntry<any>>();

  /**
   * Save data to cache with a timestamp and version
   * Falls back to in-memory cache if localStorage is full
   * @param _ttl - Time to live in milliseconds (not currently used in storage, but preserved for API consistency)
   */
  static set<T>(key: string, data: T, _ttl: number = DEFAULT_TTL): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      const serialized = JSON.stringify(entry);
      
      // Check if we have enough space (rough estimate)
      if (this.isQuotaAvailable(serialized.length)) {
        localStorage.setItem(key, serialized);
      } else {
        // localStorage full, try clearing old cache entries
        this.clearOldEntries();
        
        // Try again after clearing
        try {
          localStorage.setItem(key, serialized);
        } catch {
          // Still failing, use memory cache as fallback
          this.memoryCache.set(key, entry);
          console.warn('localStorage full, using memory cache for:', key);
        }
      }
    } catch (error: any) {
      // Handle quota exceeded errors
      if (error?.name === 'QuotaExceededError' || error?.code === 22) {
        this.clearOldEntries();
        // Fallback to memory cache
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          version: CACHE_VERSION,
        };
        this.memoryCache.set(key, entry);
        console.warn('localStorage quota exceeded, using memory cache');
      } else {
        console.warn('Failed to save to cache:', error);
      }
    }
  }

  /**
   * Check if localStorage has enough space (rough estimate)
   */
  private static isQuotaAvailable(requiredBytes: number): boolean {
    try {
      // Most browsers allow 5-10MB, check if we're using more than 80%
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const item = localStorage.getItem(key);
          totalSize += (item?.length || 0) + key.length;
        }
      }
      
      // Conservative estimate: 4MB limit (80% of 5MB)
      const SAFE_QUOTA = 4 * 1024 * 1024;
      return (totalSize + requiredBytes) < SAFE_QUOTA;
    } catch {
      return true; // If we can't check, allow the attempt
    }
  }

  /**
   * Clear entries older than their TTL to free up space
   */
  private static clearOldEntries(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith('rcbc-')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry: CacheEntry<any> = JSON.parse(item);
              // Remove if older than 24 hours
              if (now - entry.timestamp > DEFAULT_TTL) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // Invalid entry, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear old cache entries:', error);
    }
  }

  /**
   * Retrieve data from cache if it exists and hasn't expired
   * Checks both localStorage and memory cache
   */
  static get<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
    try {
      // Try localStorage first
      const cached = localStorage.getItem(key);
      if (cached) {
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
      }

      // Fallback to memory cache
      const memEntry = this.memoryCache.get(key);
      if (memEntry) {
        const age = Date.now() - memEntry.timestamp;
        if (age <= ttl && memEntry.version === CACHE_VERSION) {
          return memEntry.data;
        } else {
          this.memoryCache.delete(key);
        }
      }

      return null;
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
