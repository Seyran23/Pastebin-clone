import { Router } from 'express';
import {
  signup, login, logout, refresh, activateProfile,
  forgotPassword, forgotUsername, resendActivationLink,
} from './controller';
import { validateSignup, validateLogin, validateUUIDParam, validateUsername, validateEmail } from './validator';
import handleValidationErrors from '../../middlewares/validation-error.middleware';
import { authMiddleware } from './middleware';

const router = Router();

router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/logout', logout);
router.post('/forgot-password', validateUsername, handleValidationErrors, forgotPassword);
router.post('/forgot-username', validateEmail, handleValidationErrors, forgotUsername);

// Bug fix: was "resend-activation" (missing leading slash) — Express 5 is strict about this
router.post('/resend-activation', validateUsername, handleValidationErrors, resendActivationLink);

router.get('/refresh', refresh);
router.get('/verify-email/:activationLink', authMiddleware, validateUUIDParam, handleValidationErrors, activateProfile);

export default router;
