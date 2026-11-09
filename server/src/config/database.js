import mongoose from 'mongoose';

/**
 * Database Configuration
 * Connects to MongoDB using the connection string from environment variables
 */

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swasthyacare';

    console.log('🔄 Attempting to connect to MongoDB...');

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Make sure MongoDB is running locally or check your MONGODB_URI');
    process.exit(1); // Exit if database connection fails
  }
};

export default connectDB;
