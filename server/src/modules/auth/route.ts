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

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 20
 *     responses:
 *       201:
 *         description: User created — verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       409:
 *         description: Username or email already exists
 */
router.post('/signup', signupLimiter, validateSignup, handleValidationErrors, signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Incorrect password or OAuth-only account
 *       404:
 *         description: User not found
 */
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out and invalidate refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username]
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent
 *       404:
 *         description: User not found
 */
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateUsername,
  handleValidationErrors,
  forgotPassword,
);

/**
 * @swagger
 * /auth/forgot-username:
 *   post:
 *     summary: Send username reminder email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Username reminder email sent
 *       404:
 *         description: User not found
 */
router.post('/forgot-username', validateEmail, handleValidationErrors, forgotUsername);

/**
 * @swagger
 * /auth/resend-activation:
 *   post:
 *     summary: Resend email verification link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Activation email resent
 *       409:
 *         description: Account already activated
 */
router.post('/resend-activation', validateUsername, handleValidationErrors, resendActivationLink);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token from email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 20
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh access and refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token pair issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid or expired refresh token
 */
router.get('/refresh', refresh);

/**
 * @swagger
 * /auth/verify-email/{activationLink}:
 *   get:
 *     summary: Verify email address
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activationLink
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Email verified — new tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       403:
 *         description: Not authorized to activate this account
 *       404:
 *         description: Invalid activation link
 *       409:
 *         description: Account already activated
 */
router.get(
  '/verify-email/:activationLink',
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  activateProfile,
);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth sign-in
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google consent screen
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }) as RequestHandler,
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback — redirects to client with tokens
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to CLIENT_URL/oauth/callback?accessToken=...&refreshToken=...
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=oauth_failed',
  }) as RequestHandler,
  googleCallback,
);

export default router;
