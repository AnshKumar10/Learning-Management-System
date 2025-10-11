import { commonSchemas } from '@/validations/common';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { zNumberFromString, zEnumFromEnv, zURL, zEmail } = commonSchemas;

const envSchema = z.object({
  // Server
  PORT: zNumberFromString('PORT must be a number'),
  NODE_ENV: zEnumFromEnv(['development', 'production', 'test']),

  // MongoDB
  MONGO_URI: zURL,

  // JWT
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().min(1, 'JWT_EXPIRES_IN is required'),
  JWT_COOKIE_EXPIRES_IN: zNumberFromString(
    'JWT_COOKIE_EXPIRES_IN must be a number',
  ),

  // Client
  CLIENT_URL: zURL,

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // SMTP
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: zNumberFromString('SMTP_PORT must be a number'),
  SMTP_USER: zEmail,
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),

  // Upload
  MAX_FILE_SIZE: zNumberFromString('MAX_FILE_SIZE must be a number'),
  UPLOAD_PATH: z.string().min(1, 'UPLOAD_PATH is required'),

  // Security
  BCRYPT_SALT_ROUNDS: zNumberFromString('BCRYPT_SALT_ROUNDS must be a number'),
  RATE_LIMIT_WINDOW: zNumberFromString('RATE_LIMIT_WINDOW must be a number'),
  RATE_LIMIT_MAX: zNumberFromString('RATE_LIMIT_MAX must be a number'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
});

const createEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    const formattedErrors = parsed.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    console.error(formattedErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
};

export const env = createEnv();
export type Env = z.infer<typeof envSchema>;
