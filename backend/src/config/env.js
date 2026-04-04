import dotenv from 'dotenv';
import { z } from 'zod';
import logger from '../utils/logger.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().min(1),
  REDIS_URI: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  PAYMENT_STRIPE_SECRET: z.string().optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional().default('noreply@store.com'),
  FRONTEND_URL: z.string().url().default('http://localhost'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(6).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default('demo'), // Using demo to prevent fatal crashes during dev
  CLOUDINARY_API_KEY: z.string().optional().default('12345'),
  CLOUDINARY_API_SECRET: z.string().optional().default('secret'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
