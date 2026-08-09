import { query } from 'express-validator';

export const dashboardRangeValidators = [
  query('preset').optional().isString(),
  query('start').optional().isISO8601().withMessage('start must be a valid date'),
  query('end').optional().isISO8601().withMessage('end must be a valid date'),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];
