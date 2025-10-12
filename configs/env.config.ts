import {
  zEmail,
  zEnumFromEnv,
  zNumberFromString,
  zRequiredString,
  zURL
} from '@/validations/common';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  // Server
  PORT: zNumberFromString('PORT must be a valid number'),
  NODE_ENV: zEnumFromEnv(['development', 'production', 'test']),

  // MongoDB
  MONGO_URI: zURL(),

  // JWT
  JWT_SECRET: zRequiredString('JWT_SECRET'),
  JWT_EXPIRES_IN: zRequiredString('JWT_EXPIRES_IN'),
  JWT_COOKIE_EXPIRES_IN: zNumberFromString(
    'JWT_COOKIE_EXPIRES_IN must be a valid number'
  ),

  // Client
  CLIENT_URL: zURL(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: zRequiredString('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: zRequiredString('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: zRequiredString('CLOUDINARY_API_SECRET'),

  // SMTP
  SMTP_HOST: zRequiredString('SMTP_HOST'),
  SMTP_PORT: zNumberFromString('SMTP_PORT must be a valid number'),
  SMTP_USER: zEmail(),
  SMTP_PASS: zRequiredString('SMTP_PASS'),

  // Stripe
  STRIPE_SECRET_KEY: zRequiredString('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: zRequiredString('STRIPE_WEBHOOK_SECRET'),

  // Upload
  MAX_FILE_SIZE: zNumberFromString('MAX_FILE_SIZE must be a valid number'),
  UPLOAD_PATH: zRequiredString('UPLOAD_PATH'),

  // Security
  BCRYPT_SALT_ROUNDS: zNumberFromString(
    'BCRYPT_SALT_ROUNDS must be a valid number'
  ),
  RATE_LIMIT_WINDOW: zNumberFromString(
    'RATE_LIMIT_WINDOW must be a valid number'
  ),
  RATE_LIMIT_MAX: zNumberFromString('RATE_LIMIT_MAX must be a valid number'),

  // Razorpay
  RAZORPAY_KEY_ID: zRequiredString('RAZORPAY_KEY_ID'),
  RAZORPAY_KEY_SECRET: zRequiredString('RAZORPAY_KEY_SECRET')
});

const createEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    const formattedErrors = parsed.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message
    }));
    console.error(formattedErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
};

export const env = createEnv();
export type Env = z.infer<typeof envSchema>;
