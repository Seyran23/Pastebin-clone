import { Router } from 'express';
import {
  getProfile, updateAvatar, updateUserProfileDetails,
  getPasteStatsForUser, deleteUser, changePassword,
} from './controller';
import { authMiddleware } from '../auth/middleware';
import upload from '../../middlewares/multer.middleware';
import { getProfilePastes } from '../paste/controller';
import { validatePasswordChange, validationUpdateUserProfile } from './validator';
import handleValidationErrors from '../../middlewares/validation-error.middleware';

const router = Router();

router.get('/profile/:username', getProfile);
router.get('/profile/:username/pastes', getProfilePastes);
router.get('/stats/:username', authMiddleware, getPasteStatsForUser);

router.patch('/edit/profile-details', authMiddleware, validationUpdateUserProfile, handleValidationErrors, updateUserProfileDetails);
router.patch('/edit/profile-avatar', authMiddleware, upload.single('avatar'), updateAvatar);
router.patch('/change-password', authMiddleware, validatePasswordChange, handleValidationErrors, changePassword);

// Route uses :username so controller can enforce ownership
router.delete('/:username', authMiddleware, deleteUser);

export default router;
