// Client-side caching utilities

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of items
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // Remove expired items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? Date.now() <= item.expiresAt : false;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache keys
export const CACHE_KEYS = {
  USER: 'user',
  PREFERENCES: 'preferences',
  DESTINATIONS: 'destinations',
  RECOMMENDATIONS: 'recommendations',
  TRAVEL_HISTORY: 'travel_history',
  ADMIN_STATS: 'admin_stats'
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000  // 1 hour
} as const;

// Cache utilities
export const cacheUtils = {
  // Generate cache key with prefix
  key: (prefix: string, ...parts: (string | number)[]): string => {
    return `${prefix}:${parts.join(':')}`;
  },

  // Cache API response
  cacheApiResponse: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> => {
    // Check cache first
    const cached = cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch data
    const data = await fetcher();
    
    // Cache the result
    cache.set(key, data, ttl);
    
    return data;
  },

  // Invalidate cache by pattern
  invalidatePattern: (pattern: string): void => {
    const regex = new RegExp(pattern);
    for (const key of cache['cache'].keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  },

  // Invalidate user-specific cache
  invalidateUserCache: (userId: string): void => {
    cacheUtils.invalidatePattern(`^${CACHE_KEYS.USER}:${userId}`);
    cacheUtils.invalidatePattern(`^${CACHE_KEYS.PREFERENCES}:${userId}`);
    cacheUtils.invalidatePattern(`^${CACHE_KEYS.RECOMMENDATIONS}:${userId}`);
    cacheUtils.invalidatePattern(`^${CACHE_KEYS.TRAVEL_HISTORY}:${userId}`);
  }
};

// Local storage cache for persistent data
export const localStorageCache = {
  set: <T>(key: string, data: T, ttl?: number): void => {
    if (typeof window === 'undefined') return;
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttl || CACHE_TTL.LONG)
    };
    
    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data to localStorage:', error);
    }
  },

  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const itemStr = localStorage.getItem(`cache:${key}`);
      if (!itemStr) return null;
      
      const item: CacheItem<T> = JSON.parse(itemStr);
      
      // Check if expired
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(`cache:${key}`);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Failed to retrieve data from localStorage cache:', error);
      return null;
    }
  },

  delete: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`cache:${key}`);
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache:')) {
        localStorage.removeItem(key);
      }
    });
  }
};
