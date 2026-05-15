import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env.local' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8080'),

  API_URL: z.string().min(1),
  CLIENT_URL: z.string().min(1),

  DB_NAME: z.string().min(1),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),

  JWT_ACCESS_TOKEN: z.string().min(1),
  JWT_REFRESH_TOKEN: z.string().min(1),
  JWT_RESET_TOKEN: z.string().min(1),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string().default('1h'),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string().default('7d'),

  S3_BUCKET_NAME: z.string().min(1),
  S3_BUCKET_REGION: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),

  REDIS_URL: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().min(1),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().default('465'),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`\n[env] Missing or invalid environment variables:\n${missing}\n`);
  process.exit(1);
}

const env = parsed.data;

export const NODE_ENV = env.NODE_ENV;
export const PORT = env.PORT;
export const API_URL = env.API_URL;
export const CLIENT_URL = env.CLIENT_URL;

export const DB_NAME = env.DB_NAME;
export const DB_USERNAME = env.DB_USERNAME;
export const DB_PASSWORD = env.DB_PASSWORD;
export const DB_HOST = env.DB_HOST;
export const DB_PORT = Number(env.DB_PORT);

export const JWT_ACCESS_TOKEN = env.JWT_ACCESS_TOKEN;
export const JWT_REFRESH_TOKEN = env.JWT_REFRESH_TOKEN;
export const JWT_RESET_TOKEN = env.JWT_RESET_TOKEN;
export const JWT_ACCESS_TOKEN_EXPIRATION_TIME = env.JWT_ACCESS_TOKEN_EXPIRATION_TIME;
export const JWT_REFRESH_TOKEN_EXPIRATION_TIME = env.JWT_REFRESH_TOKEN_EXPIRATION_TIME;

export const S3_BUCKET_NAME = env.S3_BUCKET_NAME;
export const S3_BUCKET_REGION = env.S3_BUCKET_REGION;
export const S3_ACCESS_KEY = env.S3_ACCESS_KEY;
export const S3_SECRET_ACCESS_KEY = env.S3_SECRET_ACCESS_KEY;

export const REDIS_URL = env.REDIS_URL;

export const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = env.GOOGLE_CALLBACK_URL;

export const SMTP_HOST = env.SMTP_HOST;
export const SMTP_PORT = Number(env.SMTP_PORT);
export const SMTP_USER = env.SMTP_USER;
export const SMTP_PASSWORD = env.SMTP_PASSWORD;
