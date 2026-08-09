import { body } from 'express-validator';
import { withStrongPasswordRules } from '../../utils/passwordPolicy.js';

export const registerValidators = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3, max: 80 })
    .withMessage('Name must be between 3 and 80 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  withStrongPasswordRules(body('password').notEmpty().withMessage('Password is required')),
];

export const loginValidators = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateMeValidators = [
  body('fullName').optional().isString().trim().isLength({ min: 3, max: 80 }),
  body('name').optional().isString().trim().isLength({ min: 3, max: 80 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional({ nullable: true }).isString().trim().isLength({ max: 40 }),
];

export const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  withStrongPasswordRules(body('newPassword').notEmpty().withMessage('New password is required')),
];

export const refreshValidators = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required').isString(),
];
