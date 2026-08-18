import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  let retryCount = 0;

  const connectWithRetry = async () => {
    try {
      console.log('📡 Attempting MongoDB connection...');
      const conn = await mongoose.connect(env.MONGODB_URI);
      console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      retryCount++;
      console.error(`❌ Error connecting to MongoDB (Attempt ${retryCount}/${maxRetries}): ${(error as Error).message}`);
      if (retryCount < maxRetries) {
        console.log(`📡 Retrying database connection in 5 seconds...`);
        setTimeout(connectWithRetry, 5000);
      } else {
        console.error('❌ Max database connection retries exceeded. Exiting...');
        process.exit(1);
      }
    }
  };

  await connectWithRetry();

  // Monitor connection states
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost. Database state is currently disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('📡 MongoDB connection restored.');
  });

  // Graceful Shutdown hooks
  const gracefulExit = async (signal: string) => {
    try {
      console.log(`📡 Received ${signal}. Closing MongoDB connection gracefully...`);
      await mongoose.connection.close();
      console.log('📡 MongoDB connection closed. Exiting process.');
      process.exit(0);
    } catch (err) {
      console.error(`❌ Error during graceful MongoDB disconnect: ${(err as Error).message}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulExit('SIGINT'));
  process.on('SIGTERM', () => gracefulExit('SIGTERM'));
};
