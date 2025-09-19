interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

class MemoryCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private defaultTTL: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100;
  }

  set(key: string, data: T, ttl?: number): void {
    const itemTTL = ttl || this.defaultTTL;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: itemTTL
    };

  // Remove oldest items if cache is full
  if (this.cache.size >= this.maxSize) {
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

    this.cache.set(key, item);
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    
    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      expired,
      active: this.cache.size - expired
    };
  }
}

// Global cache instances
export const apiCache = new MemoryCache({ ttl: 5 * 60 * 1000, maxSize: 100 });
export const userCache = new MemoryCache({ ttl: 10 * 60 * 1000, maxSize: 50 });
export const destinationCache = new MemoryCache({ ttl: 15 * 60 * 1000, maxSize: 200 });

// Cache utilities
export const cacheUtils = {
  // Generate cache key from URL and params
  generateKey: (url: string, params?: Record<string, any>): string => {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  },

  // Cache API response
  cacheApiResponse: async <T>(
    key: string,
    apiCall: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    // Check cache first
    const cached = apiCache.get(key);
    if (cached) {
      return cached as T;
    }

    // Make API call
    const data = await apiCall();
    
    // Cache the result
    apiCache.set(key, data, ttl);
    
    return data;
  },

  // Invalidate cache by pattern
  invalidatePattern: (pattern: string): void => {
    const regex = new RegExp(pattern);
    const keys = apiCache.keys();
    
    keys.forEach(key => {
      if (regex.test(key)) {
        apiCache.delete(key);
      }
    });
  },

  // Clear all caches
  clearAll: (): void => {
    apiCache.clear();
    userCache.clear();
    destinationCache.clear();
  },

  // Cleanup expired items
  cleanup: (): void => {
    apiCache.cleanup();
    userCache.cleanup();
    destinationCache.cleanup();
  }
};

// React hook for caching
export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {}
) => {
  const { ttl, enabled = true } = options;
  
  const getCachedData = (): T | null => {
    if (!enabled) return null;
    return apiCache.get(key);
  };

  const setCachedData = (data: T): void => {
    if (!enabled) return;
    apiCache.set(key, data, ttl);
  };

  const invalidateCache = (): void => {
    apiCache.delete(key);
  };

  return {
    getCachedData,
    setCachedData,
    invalidateCache
  };
};

// Cache middleware for API calls
export const withCache = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  options: { ttl?: number } = {}
) => {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    return cacheUtils.cacheApiResponse(
      key,
      () => fn(...args),
      options.ttl
    );
  };
};

// Local storage cache (for persistence across sessions)
export const localStorageCache = {
  set: <T>(key: string, data: T, ttl?: number): void => {
    if (typeof window === 'undefined') return;
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 24 * 60 * 60 * 1000 // 24 hours default
    };
    
    localStorage.setItem(`cache:${key}`, JSON.stringify(item));
  },

  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(`cache:${key}`);
      if (!item) return null;
      
      const parsed: CacheItem<T> = JSON.parse(item);
      
      // Check if expired
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`cache:${key}`);
        return null;
      }
      
      return parsed.data;
    } catch {
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

// Auto cleanup expired items every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheUtils.cleanup();
  }, 5 * 60 * 1000);
}