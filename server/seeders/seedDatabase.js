const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Destination = require('../models/Destination');
const { sampleDestinations } = require('./sampleDestinations');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Destination.deleteMany({})
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@travelai.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create test user
    console.log('👤 Creating test user...');
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@travelai.com',
      password: 'test123',
      role: 'user',
      isActive: true
    });
    console.log(`✅ Test user created: ${testUser.email}`);

    // Insert sample destinations
    console.log('🌍 Creating sample destinations...');
    const destinations = await Destination.insertMany(sampleDestinations);
    console.log(`✅ Created ${destinations.length} destinations`);

    // Display summary
    console.log('\n📊 Database Seeding Summary:');
    console.log('============================');
    console.log(`👥 Users created: 2 (1 admin, 1 user)`);
    console.log(`🌍 Destinations created: ${destinations.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@travelai.com / admin123');
    console.log('User: test@travelai.com / test123');
    console.log('\n🎉 Database seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
