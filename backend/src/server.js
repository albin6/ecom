import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { connectRedis, redisClient } from './config/redis.js';
import logger from './utils/logger.js';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { initCheckoutExpiryListener } from './services/checkoutTask.js';

const seedAdminUser = async () => {
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    try {
      const adminExists = await User.findOne({ email: env.ADMIN_EMAIL });
      if (!adminExists) {
        await User.create({
          name: 'System Admin',
          email: env.ADMIN_EMAIL,
          password: env.ADMIN_PASSWORD,
          role: 'admin',
          isVerified: true,
        });
        logger.info(`Master admin seeded successfully: ${env.ADMIN_EMAIL}`);
      } else {
        logger.info('Master admin account already exists. Skipping seed.');
      }
    } catch (error) {
      logger.error(`Error seating admin user: ${error.message}`);
    }
  }
};

const server = http.createServer(app);

const startServer = async () => {
  // Connect to databases
  await connectDB();
  await connectRedis();

  await seedAdminUser();

  server.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();

// Graceful Shutdown
const shutdown = async () => {
  logger.info('Graceful shutdown initiated...');
  server.close(async () => {
    logger.info('HTTP server closed.');
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      logger.info('Redis connection closed.');
    }
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
