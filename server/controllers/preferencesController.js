const UserPreference = require('../models/UserPreference');

// Get user preferences
const getUserPreferences = async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({ userId: req.user._id });
    
    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create or update user preferences
const updateUserPreferences = async (req, res) => {
  try {
    const { climate, budget, adventure, culture, nature, nightlife } = req.body;

    // Validate input
    const factors = [climate, budget, adventure, culture, nature, nightlife];
    for (let factor of factors) {
      if (factor < 1 || factor > 5) {
        return res.status(400).json({ error: 'All preference values must be between 1 and 5' });
      }
    }

    // Find and update preferences (upsert)
    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        climate,
        budget,
        adventure,
        culture,
        nature,
        nightlife
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user preferences
const deleteUserPreferences = async (req, res) => {
  try {
    await UserPreference.findOneAndDelete({ userId: req.user._id });
    
    res.json({ message: 'Preferences deleted successfully' });
  } catch (error) {
    console.error('Delete preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  deleteUserPreferences
};
