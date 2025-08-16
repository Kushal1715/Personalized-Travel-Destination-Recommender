const Destination = require('../models/Destination');

// Get all destinations with optional filtering
const getAllDestinations = async (req, res) => {
  try {
    const { 
      country, 
      climate, 
      budget, 
      adventure, 
      culture, 
      nature, 
      nightlife,
      limit = 20,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (climate) filter.climate = { $gte: parseInt(climate) - 1, $lte: parseInt(climate) + 1 };
    if (budget) filter.budget = { $gte: parseInt(budget) - 1, $lte: parseInt(budget) + 1 };
    if (adventure) filter.adventure = { $gte: parseInt(adventure) - 1, $lte: parseInt(adventure) + 1 };
    if (culture) filter.culture = { $gte: parseInt(culture) - 1, $lte: parseInt(culture) + 1 };
    if (nature) filter.nature = { $gte: parseInt(nature) - 1, $lte: parseInt(nature) + 1 };
    if (nightlife) filter.nightlife = { $gte: parseInt(nightlife) - 1, $lte: parseInt(nightlife) + 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const destinations = await Destination.find(filter)
      .sort({ averageRating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Destination.countDocuments(filter);

    res.json({
      destinations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDestinations: total,
        hasNext: skip + destinations.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get destination by ID
const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ destination });
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search destinations by text
const searchDestinations = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const destinations = await Destination.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit));

    res.json({ destinations, query: q });
  } catch (error) {
    console.error('Search destinations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get popular destinations
const getPopularDestinations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const destinations = await Destination.find()
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(parseInt(limit));

    res.json({ destinations });
  } catch (error) {
    console.error('Get popular destinations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new destination (admin only)
const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    
    res.status(201).json({
      message: 'Destination created successfully',
      destination
    });
  } catch (error) {
    console.error('Create destination error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update destination (admin only)
const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({
      message: 'Destination updated successfully',
      destination
    });
  } catch (error) {
    console.error('Update destination error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete destination (admin only)
const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  searchDestinations,
  getPopularDestinations,
  createDestination,
  updateDestination,
  deleteDestination
};
