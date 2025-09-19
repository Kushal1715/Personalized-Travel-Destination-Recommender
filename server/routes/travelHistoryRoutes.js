const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTravelHistory,
  addTravelExperience,
  updateTravelExperience,
  deleteTravelExperience,
  getTravelStatistics,
  getTravelInsights,
  searchTravelHistory
} = require('../controllers/travelHistoryController');

// All routes require authentication
router.use(auth);

// GET /api/travel-history - Get user's travel history
router.get('/', getTravelHistory);

// POST /api/travel-history - Add new travel experience
router.post('/', addTravelExperience);

// GET /api/travel-history/statistics - Get travel statistics
router.get('/statistics', getTravelStatistics);

// GET /api/travel-history/insights - Get travel insights
router.get('/insights', getTravelInsights);

// GET /api/travel-history/search - Search travel history
router.get('/search', searchTravelHistory);

// PUT /api/travel-history/:id - Update travel experience
router.put('/:id', updateTravelExperience);

// DELETE /api/travel-history/:id - Delete travel experience
router.delete('/:id', deleteTravelExperience);

module.exports = router;