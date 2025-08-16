const mongoose = require('mongoose');
const Destination = require('../models/Destination');
require('dotenv').config();

const sampleDestinations = [
  {
    name: "Bali",
    country: "Indonesia",
    city: "Denpasar",
    description: "Tropical paradise with beautiful beaches, rich culture, and spiritual temples. Perfect for relaxation and adventure seekers.",
    climate: 5,
    budget: 2,
    adventure: 4,
    culture: 5,
    nature: 5,
    nightlife: 4,
    latitude: -8.3405,
    longitude: 115.0920,
    imageUrl: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800",
    averageRating: 4.5,
    totalReviews: 1250
  },
  {
    name: "Tokyo",
    country: "Japan",
    city: "Tokyo",
    description: "Ultra-modern metropolis blending cutting-edge technology with traditional Japanese culture and cuisine.",
    climate: 4,
    budget: 4,
    adventure: 3,
    culture: 5,
    nature: 2,
    nightlife: 5,
    latitude: 35.6762,
    longitude: 139.6503,
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    averageRating: 4.7,
    totalReviews: 2100
  },
  {
    name: "Santorini",
    country: "Greece",
    city: "Fira",
    description: "Stunning volcanic island with iconic white buildings, blue domes, and breathtaking sunsets over the Aegean Sea.",
    climate: 4,
    budget: 3,
    adventure: 2,
    culture: 4,
    nature: 3,
    nightlife: 3,
    latitude: 36.3932,
    longitude: 25.4615,
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
    averageRating: 4.8,
    totalReviews: 1800
  },
  {
    name: "Machu Picchu",
    country: "Peru",
    city: "Cusco",
    description: "Ancient Incan citadel set high in the Andes Mountains, offering incredible hiking and archaeological wonders.",
    climate: 3,
    budget: 2,
    adventure: 5,
    culture: 5,
    nature: 5,
    nightlife: 1,
    latitude: -13.1631,
    longitude: -72.5450,
    imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800",
    averageRating: 4.9,
    totalReviews: 950
  },
  {
    name: "New York City",
    country: "USA",
    city: "New York",
    description: "The city that never sleeps offers world-class museums, Broadway shows, diverse cuisine, and iconic landmarks.",
    climate: 3,
    budget: 5,
    adventure: 3,
    culture: 5,
    nature: 2,
    nightlife: 5,
    latitude: 40.7128,
    longitude: -74.0060,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    averageRating: 4.6,
    totalReviews: 3200
  },
  {
    name: "Swiss Alps",
    country: "Switzerland",
    city: "Zermatt",
    description: "Majestic mountain range offering world-class skiing, hiking, and stunning alpine scenery year-round.",
    climate: 2,
    budget: 5,
    adventure: 5,
    culture: 3,
    nature: 5,
    nightlife: 2,
    latitude: 46.0207,
    longitude: 7.7491,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    averageRating: 4.7,
    totalReviews: 1100
  },
  {
    name: "Marrakech",
    country: "Morocco",
    city: "Marrakech",
    description: "Vibrant city with bustling souks, stunning architecture, and rich Moroccan culture and cuisine.",
    climate: 4,
    budget: 2,
    adventure: 4,
    culture: 5,
    nature: 2,
    nightlife: 3,
    latitude: 31.6295,
    longitude: -7.9811,
    imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b5609bab?w=800",
    averageRating: 4.4,
    totalReviews: 850
  },
  {
    name: "Great Barrier Reef",
    country: "Australia",
    city: "Cairns",
    description: "World's largest coral reef system offering incredible diving, snorkeling, and marine life encounters.",
    climate: 5,
    budget: 3,
    adventure: 5,
    culture: 2,
    nature: 5,
    nightlife: 2,
    latitude: -16.9203,
    longitude: 145.7702,
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    averageRating: 4.8,
    totalReviews: 750
  },
  {
    name: "Iceland",
    country: "Iceland",
    city: "Reykjavik",
    description: "Land of fire and ice with geothermal hot springs, glaciers, waterfalls, and the Northern Lights.",
    climate: 1,
    budget: 4,
    adventure: 5,
    culture: 3,
    nature: 5,
    nightlife: 3,
    latitude: 64.9631,
    longitude: -19.0208,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    averageRating: 4.9,
    totalReviews: 1200
  },
  {
    name: "Thailand",
    country: "Thailand",
    city: "Bangkok",
    description: "Exotic destination with beautiful temples, delicious street food, and a perfect blend of tradition and modernity.",
    climate: 5,
    budget: 2,
    adventure: 4,
    culture: 5,
    nature: 4,
    nightlife: 4,
    latitude: 13.7563,
    longitude: 100.5018,
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    averageRating: 4.5,
    totalReviews: 1600
  }
];

const seedDestinations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_recommender');
    console.log('✅ Connected to MongoDB');

    // Clear existing destinations
    await Destination.deleteMany({});
    console.log('🗑️ Cleared existing destinations');

    // Insert sample destinations
    const result = await Destination.insertMany(sampleDestinations);
    console.log(`✅ Inserted ${result.length} sample destinations`);

    // Display sample destinations
    console.log('\n📍 Sample Destinations Created:');
    result.forEach(dest => {
      console.log(`  • ${dest.name}, ${dest.country} (Rating: ${dest.averageRating}/5)`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDestinations();
}

module.exports = { seedDestinations, sampleDestinations };
