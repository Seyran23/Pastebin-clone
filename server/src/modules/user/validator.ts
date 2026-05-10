import { body } from 'express-validator';

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Old password is required')
    .isString()
    .withMessage('Old password must be a string'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isString()
    .withMessage('New password must be a string')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
];

export const validationUpdateUserProfile = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .optional({ nullable: true }),
  body('location')
    .isString()
    .isLength({ max: 100 })
    .withMessage('Location must be a string with max 100 characters')
    .optional({ nullable: true }),
];
