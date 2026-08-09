import { body, query } from 'express-validator';

export const insightsQueryValidators = [
  query('force').optional().isBoolean().toBoolean(),
];

export const generateInsightsValidators = [
  body('focus').optional().isString().trim().isLength({ max: 80 }),
  body('cacheKey').optional().isString().trim().isLength({ max: 120 }),
];

export const refreshInsightsValidators = [
  body('cacheKey').optional().isString().trim().isLength({ max: 120 }),
];
