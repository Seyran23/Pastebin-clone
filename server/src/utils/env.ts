import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const PORT = process.env.PORT ?? '8080';
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const API_URL = requireEnv('API_URL');
export const CLIENT_URL = requireEnv('CLIENT_URL');

export const DB_NAME = requireEnv('DB_NAME');
export const DB_USERNAME = requireEnv('DB_USERNAME');
export const DB_PASSWORD = requireEnv('DB_PASSWORD');
export const DB_LOCALHOST = process.env.DB_LOCALHOST ?? 'localhost';

export const JWT_ACCESS_TOKEN = requireEnv('JWT_ACCESS_TOKEN');
export const JWT_REFRESH_TOKEN = requireEnv('JWT_REFRESH_TOKEN');
export const JWT_RESET_TOKEN = requireEnv('JWT_RESET_TOKEN');
export const JWT_ACCESS_TOKEN_EXPIRATION_TIME =
  process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME ?? '1h';
export const JWT_REFRESH_TOKEN_EXPIRATION_TIME =
  process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME ?? '7d';

export const S3_BUCKET_NAME = requireEnv('S3_BUCKET_NAME');
export const S3_BUCKET_REGION = requireEnv('S3_BUCKET_REGION');
export const S3_ACCESS_KEY = requireEnv('S3_ACCESS_KEY');
export const S3_SECRET_ACCESS_KEY = requireEnv('S3_SECRET_ACCESS_KEY');

export const REDIS_URL = requireEnv('REDIS_URL');

export const SMTP_HOST = requireEnv('SMTP_HOST');
export const SMTP_PORT = Number(process.env.SMTP_PORT ?? '465');
export const SMTP_USER = requireEnv('SMTP_USER');
export const SMTP_PASSWORD = requireEnv('SMTP_PASSWORD');
