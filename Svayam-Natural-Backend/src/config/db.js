import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('TIP: Make sure your MongoDB service is running locally or check your MONGODB_URI in .env');
    process.exit(1);
  }
};

export default connectDB;
