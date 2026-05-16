import rateLimit from 'express-rate-limit';
import { NODE_ENV } from '@/utils/env';

const skip = () => NODE_ENV === 'test';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip,
  message: { status: 'fail', message: 'Too many login attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skip,
  message: { status: 'fail', message: 'Too many accounts created, please try again in an hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skip,
  message: { status: 'fail', message: 'Too many requests, please try again in an hour' },
  standardHeaders: true,
  legacyHeaders: false,
});
