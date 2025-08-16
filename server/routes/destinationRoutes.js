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

const router = express.Router();

// Public routes
router.get('/', getAllDestinations);
router.get('/search', searchDestinations);
router.get('/popular', getPopularDestinations);
router.get('/:id', getDestinationById);

// Admin routes (you can add admin middleware later)
router.post('/', createDestination);
router.put('/:id', updateDestination);
router.delete('/:id', deleteDestination);

module.exports = router;
