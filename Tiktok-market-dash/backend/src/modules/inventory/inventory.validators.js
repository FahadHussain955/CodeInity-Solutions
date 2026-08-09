import { body, param, query } from 'express-validator';

export const inventoryListValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim(),
  query('status').optional().isString(),
  query('sort').optional().isString(),
];

export const inventoryIdValidators = [
  param('id').isString().notEmpty().withMessage('Inventory id is required'),
];

export const updateStockValidators = [
  ...inventoryIdValidators,
  body('currentStock').isInt({ min: 0 }).withMessage('currentStock must be a non-negative integer'),
  body('reservedStock').optional().isInt({ min: 0 }),
  body('reason').optional().isString().trim().isLength({ max: 500 }),
];

export const adjustStockValidators = [
  ...inventoryIdValidators,
  body('delta').isInt().withMessage('delta must be an integer'),
  body('reason').optional().isString().trim().isLength({ max: 500 }),
];

export const restockValidators = [
  ...inventoryIdValidators,
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('reason').optional().isString().trim().isLength({ max: 500 }),
];

export const markOutValidators = [
  ...inventoryIdValidators,
  body('reason').optional().isString().trim().isLength({ max: 500 }),
];

export const bulkUpdateValidators = [
  body('updates').isArray({ min: 1 }).withMessage('updates must be a non-empty array'),
  body('updates.*.id').isString().notEmpty(),
  body('updates.*.currentStock').optional().isInt({ min: 0 }),
  body('updates.*.inStock').optional().isInt({ min: 0 }),
  body('updates.*.reservedStock').optional().isInt({ min: 0 }),
  body('updates.*.reason').optional().isString().trim(),
];
