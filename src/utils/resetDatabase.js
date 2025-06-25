const mongoose = require('mongoose');
const User = require('../models/user.model');
const Property = require('../models/property.model');

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop the users collection entirely (this removes all indexes)
    await User.collection.drop().catch(() => {
      console.log('Users collection does not exist, skipping drop');
    });
    
    // Drop the properties collection entirely
    await Property.collection.drop().catch(() => {
      console.log('Properties collection does not exist, skipping drop');
    });
    
    // Recreate the collections with proper indexes
    await User.createCollection();
    await Property.createCollection();
    
    // Ensure proper indexes are created
    await User.ensureIndexes();
    await Property.ensureIndexes();
    
    console.log('✅ Database reset successfully!');
    console.log('Collections recreated with proper indexes');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
};

module.exports = resetDatabase; 