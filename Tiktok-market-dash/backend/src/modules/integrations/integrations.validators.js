import { body, param, query } from 'express-validator';

export const connectValidators = [
  body('provider').optional().isString(),
  body('platform').optional().isString(),
  body('storeName').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('storeUrl').optional().isString().trim().isLength({ min: 3, max: 250 }),
  body('url').optional().isString().trim().isLength({ min: 3, max: 250 }),
  body('accessToken').optional().isString(),
  body('apiToken').optional().isString(),
  body('refreshToken').optional().isString(),
  body('storeId').optional().isString(),
];

export const updateValidators = [
  param('id').isString().notEmpty(),
  body('storeName').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('storeUrl').optional().isString().trim().isLength({ min: 3, max: 250 }),
  body('url').optional().isString().trim().isLength({ min: 3, max: 250 }),
  body('accessToken').optional().isString(),
  body('apiToken').optional().isString(),
  body('refreshToken').optional().isString(),
  body('storeId').optional().isString(),
];

export const idValidators = [param('id').isString().notEmpty()];

export const logsValidators = [
  ...idValidators,
  query('limit').optional().isInt({ min: 1, max: 50 }),
];
