import { createClient } from 'redis';
import { env } from './env.js';
import logger from '../utils/logger.js';

export const redisClient = createClient({
  url: env.REDIS_URI
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Connected'));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Could not connect to Redis:', error);
    process.exit(1);
  }
};
