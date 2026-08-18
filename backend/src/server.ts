import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { seedDatabase } from './utils/seeder';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Pre-seed learning resources collections
  await seedDatabase();

  const port = env.PORT;
  app.listen(port, () => {
    console.log(`🚀 AI Mentor Server is running in ${env.NODE_ENV} mode on port ${port}`);
    console.log(`🔗 Healthcheck available at: http://localhost:${port}/health`);
  });
};

startServer().catch((error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});
