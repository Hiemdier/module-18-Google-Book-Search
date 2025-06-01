import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const db = async (): Promise<typeof mongoose.connection> => {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Database connected.');
      return mongoose.connection;
    } catch (error) {
      console.error('Database connection error:', error);
      throw new Error('Database connection failed.');
    }
  };
  
  export default db;