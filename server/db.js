const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log the connection attempt
    console.log('Attempting MongoDB connection...');
    
    // Add connection options
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 30000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log('MongoDB Connected Successfully');
    console.log('Connected to database:', conn.connection.name);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Test query to verify connection
    const testQuery = await conn.connection.db.command({ ping: 1 });
    console.log('Database ping successful:', testQuery.ok === 1);

    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    throw error;
  }
};

module.exports = connectDB;