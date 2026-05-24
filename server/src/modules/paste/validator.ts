import bcrypt from 'bcrypt';
import { body, param } from 'express-validator';

export const validateCreatePaste = [
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required')
    .isLength({ max: 1_000_000 })
    .withMessage('Content must not exceed 1 MB'),
  body('category')
    .isInt()
    .withMessage('Category must be an integer ID')
    .toInt()
    .optional({ nullable: true }),
  body('syntaxHighlight')
    .isInt()
    .withMessage('Syntax Highlight must be an integer ID')
    .toInt()
    .optional({ nullable: true }),
  body('exposure').isIn(['public', 'private', 'unlisted']).withMessage('Invalid exposure value'),
  body('expirationTime').notEmpty().withMessage('Expiration Time is required'),
  body('name').notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name must not exceed 255 characters'),
];

export const validateEditPaste = [
  body('title')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Title must be a string with a maximum of 100 characters'),
  body('content').optional().isString().withMessage('Content must be a string'),
  body('exposure')
    .optional()
    .isIn(['public', 'private', 'unlisted'])
    .withMessage('Exposure must be one of: public, private, or unlisted'),
  body('password').optional().isString().withMessage('Password must be a string'),
];

export const validateCreateComment = [
  param('id').isUUID().withMessage('Invalid ID format, must be a UUID'),
  body('content')
    .isLength({ min: 1 }).withMessage('Comment cannot be empty')
    .isLength({ max: 5000 }).withMessage('Comment must not exceed 5000 characters'),
];

export const validateUUIDParam = [
  param('id').isUUID().withMessage('Invalid ID format, must be a UUID'),
];

export const validateIntParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ID format, must be a positive integer'),
];

export const validateLinkWithRegex = [
  param('link')
    .matches(/^[a-zA-Z0-9]{8}$/)
    .withMessage('Invalid link format or length'),
];

export const validateExpiration = (expirationTime: number | null): void => {
  if (expirationTime && Date.now() > expirationTime) {
    throw new Error('Paste has expired');
  }
};

export const validatePassword = async (
  inputPassword: string,
  storedPassword: string,
): Promise<void> => {
  const isCorrect = await bcrypt.compare(inputPassword, storedPassword);
  if (!isCorrect) throw new Error('Invalid Password');
};
