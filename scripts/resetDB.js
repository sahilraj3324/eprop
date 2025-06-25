require('dotenv').config();
const mongoose = require('mongoose');
const resetDatabase = require('../src/utils/resetDatabase');

const runReset = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test');
    console.log('📦 Connected to MongoDB');
    
    // Reset the database
    await resetDatabase();
    
    // Disconnect
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    console.log('🎉 Database reset completed successfully!');
    
  } catch (error) {
    console.error('💥 Error during database reset:', error);
    process.exit(1);
  }
};

runReset(); 