const NodeCache = require('node-cache');

// Create cache instance
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Don't clone objects for better performance
});

// Cache middleware
const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const key = `${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    // Check if data exists in cache
    const cachedData = cache.get(key);
    if (cachedData) {
      console.log(`Cache hit for key: ${key}`);
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      // Cache the response
      cache.set(key, data, ttl);
      console.log(`Cached response for key: ${key}`);
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Cache invalidation middleware
const invalidateCache = (pattern) => {
  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to invalidate cache
    res.json = function(data) {
      // Invalidate cache based on pattern
      const keys = cache.keys();
      const regex = new RegExp(pattern);
      
      keys.forEach(key => {
        if (regex.test(key)) {
          cache.del(key);
          console.log(`Invalidated cache key: ${key}`);
        }
      });

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Cache statistics
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

// Clear all cache
const clearCache = () => {
  cache.flushAll();
  console.log('Cache cleared');
};

// Cache TTL constants
const CACHE_TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 900,      // 15 minutes
  VERY_LONG: 3600 // 1 hour
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  getCacheStats,
  clearCache,
  CACHE_TTL
};
