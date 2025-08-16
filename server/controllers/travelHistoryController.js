const TravelHistory = require('../models/TravelHistory');
const Destination = require('../models/Destination');

// Get user's travel history
const getTravelHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const travelHistory = await TravelHistory.find({ userId })
      .populate('destinationId', 'name country city description imageUrl')
      .sort({ visitDate: -1 })
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
    const { destinationId, visitDate, rating, review, photos, cost, duration, travelCompanions } = req.body;

    // Validate destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    // Check if user already has a record for this destination
    const existingRecord = await TravelHistory.findOne({ userId, destinationId });
    if (existingRecord) {
      return res.status(400).json({ error: 'Travel record already exists for this destination' });
    }

    // Create travel history record
    const travelRecord = await TravelHistory.create({
      userId,
      destinationId,
      visitDate,
      rating,
      review,
      photos,
      cost,
      duration,
      travelCompanions
    });

    // Update destination average rating
    const allRatings = await TravelHistory.find({ destinationId }).select('rating');
    const totalRating = allRatings.reduce((sum, record) => sum + (record.rating || 0), 0);
    const averageRating = totalRating / allRatings.length;

    await Destination.findByIdAndUpdate(destinationId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: allRatings.length
    });

    const populatedRecord = await TravelHistory.findById(travelRecord._id)
      .populate('destinationId', 'name country city description imageUrl');

    res.status(201).json({
      message: 'Travel experience added successfully',
      travelRecord: populatedRecord
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
    const userId = req.user._id;
    const { travelHistoryId } = req.params;
    const updateData = req.body;

    const travelRecord = await TravelHistory.findOne({ _id: travelHistoryId, userId });
    if (!travelRecord) {
      return res.status(404).json({ error: 'Travel record not found' });
    }

    // Update the record
    Object.assign(travelRecord, updateData);
    await travelRecord.save();

    // Update destination average rating if rating changed
    if (updateData.rating !== undefined) {
      const allRatings = await TravelHistory.find({ destinationId: travelRecord.destinationId }).select('rating');
      const totalRating = allRatings.reduce((sum, record) => sum + (record.rating || 0), 0);
      const averageRating = totalRating / allRatings.length;

      await Destination.findByIdAndUpdate(travelRecord.destinationId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allRatings.length
      });
    }

    const updatedRecord = await TravelHistory.findById(travelHistoryId)
      .populate('destinationId', 'name country city description imageUrl');

    res.json({
      message: 'Travel experience updated successfully',
      travelRecord: updatedRecord
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
    const userId = req.user._id;
    const { travelHistoryId } = req.params;

    const travelRecord = await TravelHistory.findOne({ _id: travelHistoryId, userId });
    if (!travelRecord) {
      return res.status(404).json({ error: 'Travel record not found' });
    }

    await TravelHistory.findByIdAndDelete(travelHistoryId);

    // Update destination average rating
    const allRatings = await TravelHistory.find({ destinationId: travelRecord.destinationId }).select('rating');
    if (allRatings.length > 0) {
      const totalRating = allRatings.reduce((sum, record) => sum + (record.rating || 0), 0);
      const averageRating = totalRating / allRatings.length;

      await Destination.findByIdAndUpdate(travelRecord.destinationId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allRatings.length
      });
    } else {
      await Destination.findByIdAndUpdate(travelRecord.destinationId, {
        averageRating: 0,
        totalReviews: 0
      });
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

    const travelHistory = await TravelHistory.find({ userId })
      .populate('destinationId', 'country climate budget adventure culture nature nightlife');

    if (travelHistory.length === 0) {
      return res.json({
        totalTrips: 0,
        totalCountries: 0,
        averageRating: 0,
        totalCost: 0,
        favoriteCountries: [],
        travelPatterns: {}
      });
    }

    // Calculate statistics
    const totalTrips = travelHistory.length;
    const totalCountries = new Set(travelHistory.map(t => t.destinationId?.country)).size;
    const totalRating = travelHistory.reduce((sum, t) => sum + (t.rating || 0), 0);
    const averageRating = totalRating / totalTrips;
    const totalCost = travelHistory.reduce((sum, t) => sum + (t.cost || 0), 0);

    // Favorite countries
    const countryCounts = travelHistory.reduce((acc, t) => {
      const country = t.destinationId?.country;
      if (country) {
        acc[country] = (acc[country] || 0) + 1;
      }
      return acc;
    }, {});

    const favoriteCountries = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    // Travel patterns (preferences based on visited destinations)
    const travelPatterns = {
      climate: travelHistory.reduce((sum, t) => sum + (t.destinationId?.climate || 0), 0) / totalTrips,
      budget: travelHistory.reduce((sum, t) => sum + (t.destinationId?.budget || 0), 0) / totalTrips,
      adventure: travelHistory.reduce((sum, t) => sum + (t.destinationId?.adventure || 0), 0) / totalTrips,
      culture: travelHistory.reduce((sum, t) => sum + (t.destinationId?.culture || 0), 0) / totalTrips,
      nature: travelHistory.reduce((sum, t) => sum + (t.destinationId?.nature || 0), 0) / totalTrips,
      nightlife: travelHistory.reduce((sum, t) => sum + (t.destinationId?.nightlife || 0), 0) / totalTrips
    };

    res.json({
      totalTrips,
      totalCountries,
      averageRating: Math.round(averageRating * 10) / 10,
      totalCost,
      favoriteCountries,
      travelPatterns
    });

  } catch (error) {
    console.error('Get travel statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTravelHistory,
  addTravelExperience,
  updateTravelExperience,
  deleteTravelExperience,
  getTravelStatistics
};
