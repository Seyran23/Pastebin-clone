import { Router } from 'express';

import upload from '@/middlewares/multer.middleware';
import handleValidationErrors from '@/middlewares/validation-error.middleware';
import { authMiddleware } from '@/modules/auth/middleware';
import { getProfilePastes } from '@/modules/paste/controller';

import {
  changePassword,
  deleteUser,
  getPasteStatsForUser,
  getProfile,
  updateAvatar,
  updateUserProfileDetails,
} from './controller';
import { validatePasswordChange, validationUpdateUserProfile } from './validator';

const router = Router();

router.get('/profile/:username', getProfile);
router.get('/profile/:username/pastes', getProfilePastes);
router.get('/stats/:username', authMiddleware, getPasteStatsForUser);

router.patch(
  '/edit/profile-details',
  authMiddleware,
  validationUpdateUserProfile,
  handleValidationErrors,
  updateUserProfileDetails,
);
router.patch('/edit/profile-avatar', authMiddleware, upload.single('avatar'), updateAvatar);
router.patch(
  '/change-password',
  authMiddleware,
  validatePasswordChange,
  handleValidationErrors,
  changePassword,
);

router.delete('/:username', authMiddleware, deleteUser);

export default router;
