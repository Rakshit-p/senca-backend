const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'Exists' : 'Missing');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Remove deprecated options
      serverSelectionTimeoutMS: 5000, // Wait 5 seconds before timing out
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log('MongoDB Connected:', conn.connection.host);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    // Log more details about the error
    if (error.name === 'MongoServerSelectionError') {
      console.error('Connection Details:', {
        uri: process.env.MONGO_URI ? 'URI exists' : 'URI missing',
        errorCode: error.code,
        reason: error.reason
      });
    }
    throw error;
  }
};

module.exports = connectDB;