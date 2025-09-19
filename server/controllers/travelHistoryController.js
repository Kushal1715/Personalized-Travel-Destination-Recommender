const TravelHistory = require('../models/TravelHistory');
const Destination = require('../models/Destination');
const User = require('../models/User');

// Get user's travel history with pagination
const getTravelHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, sortBy = 'visitDate', sortOrder = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const travelHistory = await TravelHistory.find({ userId })
      .populate('destinationId', 'name country city imageUrl averageRating')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TravelHistory.countDocuments({ userId });

    res.json({
      travelHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTrips: total,
        hasNext: skip + travelHistory.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get travel history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add new travel experience
const addTravelExperience = async (req, res) => {
  try {
    const userId = req.user._id;
    const travelData = {
      ...req.body,
      userId
    };

    // Validate destination exists
    const destination = await Destination.findById(travelData.destinationId);
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    const travelHistory = await TravelHistory.create(travelData);
    await travelHistory.populate('destinationId', 'name country city imageUrl averageRating');

    res.status(201).json({
      message: 'Travel experience added successfully',
      travelHistory
    });
  } catch (error) {
    console.error('Add travel experience error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update travel experience
const updateTravelExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const travelHistory = await TravelHistory.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('destinationId', 'name country city imageUrl averageRating');

    if (!travelHistory) {
      return res.status(404).json({ error: 'Travel experience not found' });
    }

    res.json({
      message: 'Travel experience updated successfully',
      travelHistory
    });
  } catch (error) {
    console.error('Update travel experience error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete travel experience
const deleteTravelExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const travelHistory = await TravelHistory.findOneAndDelete({ _id: id, userId });

    if (!travelHistory) {
      return res.status(404).json({ error: 'Travel experience not found' });
    }

    res.json({ message: 'Travel experience deleted successfully' });
  } catch (error) {
    console.error('Delete travel experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get travel statistics
const getTravelStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalTrips,
      countriesVisited,
      averageRating,
      totalCost,
      favoriteCountries,
      travelPatterns
    ] = await Promise.all([
      TravelHistory.countDocuments({ userId }),
      TravelHistory.distinct('destinationId', { userId }),
      TravelHistory.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      TravelHistory.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, totalCost: { $sum: '$cost' } } }
      ]),
      TravelHistory.aggregate([
        { $match: { userId: userId } },
        { $lookup: {
          from: 'destinations',
          localField: 'destinationId',
          foreignField: '_id',
          as: 'destination'
        }},
        { $unwind: '$destination' },
        { $group: {
          _id: '$destination.country',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      TravelHistory.aggregate([
        { $match: { userId: userId } },
        { $lookup: {
          from: 'destinations',
          localField: 'destinationId',
          foreignField: '_id',
          as: 'destination'
        }},
        { $unwind: '$destination' },
        { $group: {
          _id: null,
          avgClimate: { $avg: '$destination.climate' },
          avgBudget: { $avg: '$destination.budget' },
          avgAdventure: { $avg: '$destination.adventure' },
          avgCulture: { $avg: '$destination.culture' },
          avgNature: { $avg: '$destination.nature' },
          avgNightlife: { $avg: '$destination.nightlife' }
        }}
      ])
    ]);

    // Get country names for countries visited
    const countryNames = await Destination.find(
      { _id: { $in: countriesVisited } },
      'country'
    ).distinct('country');

    const stats = {
      totalTrips,
      totalCountries: countryNames.length,
      averageRating: averageRating.length > 0 ? averageRating[0].avgRating : 0,
      totalCost: totalCost.length > 0 ? totalCost[0].totalCost : 0,
      favoriteCountries: favoriteCountries.map(country => ({
        country: country._id,
        count: country.count,
        avgRating: country.avgRating
      })),
      travelPatterns: travelPatterns.length > 0 ? {
        climate: travelPatterns[0].avgClimate,
        budget: travelPatterns[0].avgBudget,
        adventure: travelPatterns[0].avgAdventure,
        culture: travelPatterns[0].avgCulture,
        nature: travelPatterns[0].avgNature,
        nightlife: travelPatterns[0].avgNightlife
      } : {
        climate: 0,
        budget: 0,
        adventure: 0,
        culture: 0,
        nature: 0,
        nightlife: 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get travel statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get travel insights and recommendations
const getTravelInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    const [recentTrips, topRatedTrips, budgetAnalysis, seasonalPatterns] = await Promise.all([
      TravelHistory.find({ userId })
        .populate('destinationId', 'name country city imageUrl')
        .sort({ visitDate: -1 })
        .limit(5),
      TravelHistory.find({ userId, rating: { $gte: 4 } })
        .populate('destinationId', 'name country city imageUrl')
        .sort({ rating: -1 })
        .limit(5),
      TravelHistory.aggregate([
        { $match: { userId: userId, cost: { $gt: 0 } } },
        { $group: {
          _id: null,
          avgCost: { $avg: '$cost' },
          minCost: { $min: '$cost' },
          maxCost: { $max: '$cost' },
          totalSpent: { $sum: '$cost' }
        }}
      ]),
      TravelHistory.aggregate([
        { $match: { userId: userId } },
        { $group: {
          _id: { $month: '$visitDate' },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    const insights = {
      recentTrips,
      topRatedTrips,
      budgetAnalysis: budgetAnalysis.length > 0 ? budgetAnalysis[0] : {
        avgCost: 0,
        minCost: 0,
        maxCost: 0,
        totalSpent: 0
      },
      seasonalPatterns: seasonalPatterns.map(month => ({
        month: month._id,
        monthName: new Date(0, month._id - 1).toLocaleString('default', { month: 'long' }),
        count: month.count,
        avgRating: month.avgRating
      }))
    };

    res.json(insights);
  } catch (error) {
    console.error('Get travel insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search travel history
const searchTravelHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const travelHistory = await TravelHistory.find({
      userId,
      $or: [
        { review: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { activities: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .populate('destinationId', 'name country city imageUrl')
    .sort({ visitDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await TravelHistory.countDocuments({
      userId,
      $or: [
        { review: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { activities: { $in: [new RegExp(q, 'i')] } }
      ]
    });

    res.json({
      travelHistory,
      query: q,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalResults: total,
        hasNext: skip + travelHistory.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Search travel history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTravelHistory,
  addTravelExperience,
  updateTravelExperience,
  deleteTravelExperience,
  getTravelStatistics,
  getTravelInsights,
  searchTravelHistory
};