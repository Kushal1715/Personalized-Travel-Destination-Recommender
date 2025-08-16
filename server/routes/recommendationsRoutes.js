const express = require('express');
const { 
  getPersonalizedRecommendations,
  getUserRecommendations,
  markRecommendationViewed,
  toggleRecommendationBookmark,
  getRecommendationAnalysis,
  getRecommendationInsights
} = require('../controllers/recommendationsController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get personalized recommendations
router.get('/personalized', getPersonalizedRecommendations);

// Get user's recommendation history
router.get('/history', getUserRecommendations);

// Get recommendation insights
router.get('/insights', getRecommendationInsights);

// Mark recommendation as viewed
router.patch('/:recommendationId/viewed', markRecommendationViewed);

// Toggle recommendation bookmark
router.patch('/:recommendationId/bookmark', toggleRecommendationBookmark);

// Get recommendation analysis for a specific destination
router.get('/analysis/:destinationId', getRecommendationAnalysis);

module.exports = router;
