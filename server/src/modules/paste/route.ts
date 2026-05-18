import { Router } from 'express';

import handleValidationErrors from '@/middlewares/validation-error.middleware';
import { authMiddleware, optionalAuth } from '@/modules/auth/middleware';

import {
  createComment,
  createPaste,
  deleteComment,
  deletePaste,
  getArchive,
  getComments,
  getUserComments,
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
  validateEditPaste,
  validateLinkWithRegex,
  validateUUIDParam,
} from './validator';

const router = Router();

/**
 * @swagger
 * /pastes/categories:
 *   get:
 *     summary: Get all paste categories
 *     tags: [Pastes]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /pastes/expiration-time:
 *   get:
 *     summary: Get all expiration time options
 *     tags: [Pastes]
 *     responses:
 *       200:
 *         description: List of expiration labels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/expiration-time', getExpirationTime);

/**
 * @swagger
 * /pastes/syntax-highlights:
 *   get:
 *     summary: Get all syntax highlight options
 *     tags: [Pastes]
 *     responses:
 *       200:
 *         description: List of syntax highlight languages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SyntaxHighlight'
 */
router.get('/syntax-highlights', getSyntaxHighlights);

/**
 * @swagger
 * /pastes/summary:
 *   get:
 *     summary: Get paste summaries (public or mine)
 *     tags: [Pastes]
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [public, mine]
 *     responses:
 *       200:
 *         description: List of paste summaries
 *       400:
 *         description: Invalid type
 */
router.get('/summary', optionalAuth, getPasteSummary);

/**
 * @swagger
 * /pastes/archive:
 *   get:
 *     summary: Get paginated archive of all public pastes
 *     tags: [Pastes]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO date cursor for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of public pastes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ArchiveItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     hasNextPage: { type: boolean }
 *                     nextCursor: { type: string, nullable: true }
 */
router.get('/archive', getArchive);

/**
 * @swagger
 * /pastes/search:
 *   get:
 *     summary: Search public pastes by title and content preview
 *     tags: [Pastes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *       - in: query
 *         name: time
 *         schema:
 *           type: string
 *           enum: [all, day, week, month, year]
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [next, prev]
 *     responses:
 *       200:
 *         description: Paginated search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 */
router.get('/search', authMiddleware, searchPastes);

/**
 * @swagger
 * /pastes/search-self:
 *   get:
 *     summary: Search authenticated user's own pastes by title
 *     tags: [Pastes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching pastes
 */
router.get('/search-self', authMiddleware, searchMyPastes);

/**
 * @swagger
 * /pastes/like-stats/{id}:
 *   get:
 *     summary: Get like and dislike counts for a paste
 *     tags: [Pastes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Like stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeStats'
 */
router.get('/like-stats/:id', validateUUIDParam, handleValidationErrors, getLikeStats);

/**
 * @swagger
 * /pastes/comments/{id}:
 *   get:
 *     summary: Get all comments for a paste
 *     tags: [Pastes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Paste UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of comments ordered by newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommentWithAuthor'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Paste not found
 */
router.get('/comments/:id', validateUUIDParam, handleValidationErrors, getComments);

/**
 * @swagger
 * /pastes/user-comments/{username}:
 *   get:
 *     summary: Get all comments made by a user
 *     tags: [Pastes]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: List of comments with paste info ordered by newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   pasteId:
 *                     type: string
 *                     nullable: true
 *                   pasteTitle:
 *                     type: string
 *                   pasteLink:
 *                     type: string
 *                     nullable: true
 *       404:
 *         description: User not found
 */
router.get('/user-comments/:username', getUserComments);

/**
 * @swagger
 * /pastes/{link}:
 *   get:
 *     summary: Get a paste by its link endpoint
 *     tags: [Pastes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: link
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paste data or password prompt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasteInfo'
 *       403:
 *         description: Private paste — access denied
 *       404:
 *         description: Paste not found
 */
router.get('/:link', optionalAuth, validateLinkWithRegex, handleValidationErrors, getPasteByLink);

/**
 * @swagger
 * /pastes/create:
 *   post:
 *     summary: Create a new paste
 *     tags: [Pastes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, content, exposure, expirationTime]
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *               exposure:
 *                 type: string
 *                 enum: [public, private, unlisted]
 *               expirationTime:
 *                 type: string
 *               password:
 *                 type: string
 *                 nullable: true
 *               category:
 *                 type: integer
 *                 nullable: true
 *               syntaxHighlight:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Paste created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasteDto'
 *       404:
 *         description: User or expiration time not found
 */
router.post('/create', authMiddleware, validateCreatePaste, handleValidationErrors, createPaste);

/**
 * @swagger
 * /pastes/unlock-paste:
 *   post:
 *     summary: Unlock a password-protected paste
 *     tags: [Pastes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [link, password]
 *             properties:
 *               link:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paste content returned
 *       403:
 *         description: Invalid password
 *       404:
 *         description: Paste not found
 */
router.post('/unlock-paste', unlockPaste);

/**
 * @swagger
 * /pastes/like/{id}:
 *   post:
 *     summary: Like or dislike a paste
 *     tags: [Pastes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isLike]
 *             properties:
 *               isLike:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Like status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeToggleResponse'
 */
router.post(
  '/like/:id',
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  togglePasteLike,
);

/**
 * @swagger
 * /pastes/comment/{id}:
 *   post:
 *     summary: Add a comment to a paste
 *     tags: [Pastes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Paste or user not found
 */
router.post(
  '/comment/:id',
  authMiddleware,
  validateCreateComment,
  handleValidationErrors,
  createComment,
);

/**
 * @swagger
 * /pastes/{link}:
 *   patch:
 *     summary: Update a paste's name, exposure, or password
 *     tags: [Pastes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: link
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               exposure:
 *                 type: string
 *                 enum: [public, private, unlisted]
 *               password: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Paste updated
 *       403:
 *         description: Forbidden — not the owner
 *       404:
 *         description: Paste not found
 */
router.patch(
  '/:link',
  authMiddleware,
  validateLinkWithRegex,
  validateEditPaste,
  handleValidationErrors,
  updatePasteByLink,
);

/**
 * @swagger
 * /pastes/{id}:
 *   delete:
 *     summary: Delete a paste
 *     tags: [Pastes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Paste deleted
 *       403:
 *         description: Forbidden — not the owner
 *       404:
 *         description: Paste not found
 */
router.delete('/:id', authMiddleware, validateUUIDParam, handleValidationErrors, deletePaste);

/**
 * @swagger
 * /pastes/comment/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Pastes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Forbidden — not the owner
 *       404:
 *         description: Comment not found
 */
router.delete(
  '/comment/:id',
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  deleteComment,
);

export default router;
