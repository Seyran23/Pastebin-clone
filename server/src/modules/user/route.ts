import { Router } from 'express';

import upload from '@/middlewares/multer.middleware';
import handleValidationErrors from '@/middlewares/validation-error.middleware';
import { authMiddleware } from '@/modules/auth/middleware';
import { getProfilePastes } from '@/modules/paste/controller';

import {
  changePassword,
  deleteUser,
  getDashboard,
  getPasteStatsForUser,
  getProfile,
  updateAvatar,
  updateUserProfileDetails,
} from './controller';
import { validatePasswordChange, validationUpdateUserProfile } from './validator';

const router = Router();

/**
 * @swagger
 * /users/profile/{username}:
 *   get:
 *     summary: Get a user's public profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/profile/:username', getProfile);

/**
 * @swagger
 * /users/profile/{username}/pastes:
 *   get:
 *     summary: Get pastes for a user's profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pastes (public only for non-owners)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProfilePaste'
 *       404:
 *         description: User not found
 */
router.get('/profile/:username/pastes', getProfilePastes);

/**
 * @swagger
 * /users/stats/{username}:
 *   get:
 *     summary: Get paste statistics for the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paste statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStats'
 *       403:
 *         description: Forbidden — can only view your own stats
 */
router.get('/stats/:username', authMiddleware, getPasteStatsForUser);

router.get('/dashboard/:username', authMiddleware, getDashboard);

/**
 * @swagger
 * /users/edit/profile-details:
 *   patch:
 *     summary: Update email or location
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.patch(
  '/edit/profile-details',
  authMiddleware,
  validationUpdateUserProfile,
  handleValidationErrors,
  updateUserProfileDetails,
);

/**
 * @swagger
 * /users/edit/profile-avatar:
 *   patch:
 *     summary: Upload a new profile avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 newAvatar: { type: string }
 *       422:
 *         description: No file provided
 */
router.patch('/edit/profile-avatar', authMiddleware, upload.single('avatar'), updateAvatar);

/**
 * @swagger
 * /users/change-password:
 *   patch:
 *     summary: Change account password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 20
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: OAuth-only account has no password
 *       401:
 *         description: Current password incorrect
 */
router.patch(
  '/change-password',
  authMiddleware,
  validatePasswordChange,
  handleValidationErrors,
  changePassword,
);

/**
 * @swagger
 * /users/{username}:
 *   delete:
 *     summary: Delete user account and all associated data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       403:
 *         description: Forbidden — can only delete your own account
 */
router.delete('/:username', authMiddleware, deleteUser);

export default router;
