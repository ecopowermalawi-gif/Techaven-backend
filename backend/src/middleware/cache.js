import config from '../config/config.js';

// Simple in-memory cache implementation
const cache = new Map();

// Function to generate cache key from request
const generateCacheKey = (req) => {
    return `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}`;
};

// Function to check if cache is valid
const isCacheValid = (timestamp) => {
    const now = Date.now();
    const ttlMs = config.cache.ttl * 1000;
    return (now - timestamp) < ttlMs;
};

// Cache middleware
export const cacheMiddleware = (customTTL) => {
    if (!config.cache.enabled) {
        return (req, res, next) => next();
    }

    return (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = generateCacheKey(req);
        const cachedResponse = cache.get(key);

        if (cachedResponse && isCacheValid(cachedResponse.timestamp)) {
            return res.json(cachedResponse.data);
        }

        // Store original res.json function
        const originalJson = res.json;

        // Override res.json method to cache the response
        res.json = function(data) {
            const response = {
                data,
                timestamp: Date.now()
            };
            cache.set(key, response);

            // Call original res.json with data
            return originalJson.call(this, data);
        };

        next();
    };
};

// Cache invalidation middleware for specific routes
export const invalidateCache = (patterns) => {
    return (req, res, next) => {
        const invalidatePatterns = Array.isArray(patterns) ? patterns : [patterns];

        for (const [key] of cache) {
            if (invalidatePatterns.some(pattern => key.includes(pattern))) {
                cache.delete(key);
            }
        }

        next();
    };
};

// Middleware to clear entire cache
export const clearCache = (req, res, next) => {
    cache.clear();
    next();
};

// Function to remove specific cache entries
export const removeCacheEntry = (key) => {
    if (typeof key === 'string') {
        for (const cacheKey of cache.keys()) {
            if (cacheKey.includes(key)) {
                cache.delete(cacheKey);
            }
        }
    }
};

// Function to get cache size
export const getCacheSize = () => {
    return {
        entries: cache.size,
        size: JSON.stringify([...cache]).length
    };
};

// Middleware to set custom cache control headers
export const setCacheControl = (duration) => {
    return (req, res, next) => {
        if (req.method === 'GET') {
            res.set('Cache-Control', `public, max-age=${duration}`);
        } else {
            res.set('Cache-Control', 'no-store');
        }
        next();
    };
};

// Function to warm up cache with initial data
export const warmupCache = (key, data, ttl = config.cache.ttl) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

export default {
    cacheMiddleware,
    invalidateCache,
    clearCache,
    removeCacheEntry,
    getCacheSize,
    setCacheControl,
    warmupCache
};