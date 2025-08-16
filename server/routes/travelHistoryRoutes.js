const express = require('express');
const { 
  getTravelHistory,
  addTravelExperience,
  updateTravelExperience,
  deleteTravelExperience,
  getTravelStatistics
} = require('../controllers/travelHistoryController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get travel history
router.get('/', getTravelHistory);

// Get travel statistics
router.get('/statistics', getTravelStatistics);

// Add new travel experience
router.post('/', addTravelExperience);

// Update travel experience
router.put('/:travelHistoryId', updateTravelExperience);

// Delete travel experience
router.delete('/:travelHistoryId', deleteTravelExperience);

module.exports = router;
