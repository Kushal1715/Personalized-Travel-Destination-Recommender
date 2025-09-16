const express = require('express');
const { 
  getAllDestinations,
  getDestinationById,
  searchDestinations,
  getPopularDestinations,
  createDestination,
  updateDestination,
  deleteDestination
} = require('../controllers/destinationController');
const { cacheMiddleware, invalidateCache, CACHE_TTL } = require('../middleware/cache');

const router = express.Router();

// Public routes with caching
router.get('/', cacheMiddleware(CACHE_TTL.MEDIUM), getAllDestinations);
router.get('/search', cacheMiddleware(CACHE_TTL.SHORT), searchDestinations);
router.get('/popular', cacheMiddleware(CACHE_TTL.LONG), getPopularDestinations);
router.get('/:id', cacheMiddleware(CACHE_TTL.MEDIUM), getDestinationById);

// Admin routes with cache invalidation
router.post('/', invalidateCache('^/api/destinations'), createDestination);
router.put('/:id', invalidateCache('^/api/destinations'), updateDestination);
router.delete('/:id', invalidateCache('^/api/destinations'), deleteDestination);

module.exports = router;
