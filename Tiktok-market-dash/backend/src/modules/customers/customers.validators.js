import { body, param, query } from 'express-validator';

export const customersListValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim(),
  query('filter').optional().isString(),
  query('status').optional().isString(),
  query('sort').optional().isString(),
];

export const customerIdValidators = [
  param('id').isString().notEmpty().withMessage('Customer id is required'),
];

export const createCustomerValidators = [
  body('fullName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 120 }),
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isString().trim().isLength({ max: 40 }),
  body('city').optional().isString().trim().isLength({ max: 80 }),
  body('country').optional().isString().trim().isLength({ max: 80 }),
  body('address').optional().isString().trim().isLength({ max: 250 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'Active', 'Inactive']),
  body('tags').optional().isArray(),
];

export const updateCustomerValidators = [
  ...customerIdValidators,
  body('fullName').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isString().trim().isLength({ max: 40 }),
  body('city').optional().isString().trim().isLength({ max: 80 }),
  body('country').optional().isString().trim().isLength({ max: 80 }),
  body('address').optional().isString().trim().isLength({ max: 250 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'Active', 'Inactive']),
  body('tags').optional().isArray(),
];
