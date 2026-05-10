import { Router } from 'express';

import handleValidationErrors from '../../middlewares/validation-error.middleware';
import { authMiddleware, optionalAuth } from '../auth/middleware';

import {
  createComment,
  createPaste,
  deleteComment,
  deletePaste,
  getCategories,
  getExpirationTime,
  getLikeStats,
  getPasteByLink,
  getPasteSummary,
  getSyntaxHighlights,
  searchMyPastes,
  searchPastes,
  togglePasteLike,
  unlockPaste,
  updatePasteByLink,
} from './controller';
import {
  validateCreateComment,
  validateCreatePaste,
  validateLinkWithRegex,
  validateUUIDParam,
} from './validator';

const router = Router();

router.get('/categories', getCategories);
router.get('/expiration-time', getExpirationTime);
router.get('/syntax-highlights', getSyntaxHighlights);
router.get('/summary', optionalAuth, getPasteSummary);
router.get('/search', authMiddleware, searchPastes);
router.get('/search-self', authMiddleware, searchMyPastes);
router.get('/like-stats/:id', validateUUIDParam, handleValidationErrors, getLikeStats);
router.get('/:link', authMiddleware, validateLinkWithRegex, handleValidationErrors, getPasteByLink);

router.post('/create', authMiddleware, validateCreatePaste, handleValidationErrors, createPaste);
router.post('/unlock-paste', unlockPaste);
router.post(
  '/like/:id',
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  togglePasteLike,
);
router.post(
  '/comment/:id',
  authMiddleware,
  validateCreateComment,
  handleValidationErrors,
  createComment,
);

router.patch(
  '/:link',
  authMiddleware,
  validateLinkWithRegex,
  handleValidationErrors,
  updatePasteByLink,
);

router.delete('/:id', authMiddleware, validateUUIDParam, handleValidationErrors, deletePaste);
router.delete(
  '/comment/:id',
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  deleteComment,
);

export default router;
