import type { RequestHandler } from 'express';
import { Router } from 'express';

import { forgotPasswordLimiter, loginLimiter, signupLimiter } from '@/middlewares/rate-limit';
import handleValidationErrors from '@/middlewares/validation-error.middleware';
import passport from '@/modules/auth/google.strategy';

import {
  activateProfile,
  forgotPassword,
  forgotUsername,
  googleCallback,
  login,
  logout,
  refresh,
  resendActivationLink,
  resetPassword,
  signup,
} from './controller';
import { authMiddleware } from './middleware';
import {
  validateEmail,
  validateLogin,
  validateResetPassword,
  validateSignup,
  validateUsername,
  validateUUIDParam,
} from './validator';

const router = Router();

router.post('/signup', signupLimiter, validateSignup, handleValidationErrors, signup);
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, login);
router.post('/logout', logout);
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateUsername,
  handleValidationErrors,
  forgotPassword,
);
router.post('/forgot-username', validateEmail, handleValidationErrors, forgotUsername);
router.post('/resend-activation', validateUsername, handleValidationErrors, resendActivationLink);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);

router.get('/refresh', refresh);
router.get(
  '/verify-email/:activationLink',
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  activateProfile,
);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }) as RequestHandler,
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=oauth_failed',
  }) as RequestHandler,
  googleCallback,
);

export default router;
