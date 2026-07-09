const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose
 */
const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;
    if (!connUri) {
      console.error('Error: MONGODB_URI is not defined in the environment variables.');
      process.exit(1);
    }

    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB event error: ${err.message}`);
});

module.exports = connectDB;
