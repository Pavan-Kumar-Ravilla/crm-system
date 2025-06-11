// backend/test-api.js - Simple test script to verify backend is working
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const testAPI = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-system');
    console.log('✅ Database connected successfully');

    // Create a test user if it doesn't exist
    const testUserData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@crm.com',
      password: 'admin123',
      role: 'admin'
    };

    let user = await User.findOne({ email: testUserData.email });
    
    if (!user) {
      console.log('Creating test user...');
      user = new User(testUserData);
      await user.save();
      console.log('✅ Test user created successfully');
    } else {
      console.log('✅ Test user already exists');
    }

    // Test password verification
    const isValidPassword = await bcrypt.compare('admin123', user.password);
    console.log('✅ Password verification:', isValidPassword ? 'PASS' : 'FAIL');

    // Test user credentials function
    try {
      const authUser = await User.findByCredentials('admin@crm.com', 'admin123');
      console.log('✅ User.findByCredentials works correctly');
      console.log('User data:', {
        id: authUser._id,
        name: `${authUser.firstName} ${authUser.lastName}`,
        email: authUser.email,
        role: authUser.role
      });
    } catch (error) {
      console.log('❌ User.findByCredentials error:', error.message);
    }

    mongoose.connection.close();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;