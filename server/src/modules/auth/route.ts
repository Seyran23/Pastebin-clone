import { Router } from 'express';

import handleValidationErrors from '../../middlewares/validation-error.middleware';

import {
  activateProfile,
  forgotPassword,
  forgotUsername,
  login,
  logout,
  refresh,
  resendActivationLink,
  signup,
} from './controller';
import { authMiddleware } from './middleware';
import {
  validateEmail,
  validateLogin,
  validateSignup,
  validateUsername,
  validateUUIDParam,
} from './validator';

const router = Router();

router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/logout', logout);
router.post('/forgot-password', validateUsername, handleValidationErrors, forgotPassword);
router.post('/forgot-username', validateEmail, handleValidationErrors, forgotUsername);

// Bug fix: was "resend-activation" (missing leading slash) — Express 5 is strict about this
router.post('/resend-activation', validateUsername, handleValidationErrors, resendActivationLink);

router.get('/refresh', refresh);
router.get(
  '/verify-email/:activationLink',
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  activateProfile,
);

export default router;
