import { body, param, query } from 'express-validator';

export const campaignsListValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim(),
  query('status').optional().isString(),
  query('filter').optional().isString(),
  query('platform').optional().isString(),
  query('objective').optional().isString(),
  query('sort').optional().isString(),
];

export const campaignIdValidators = [
  param('id').isString().notEmpty().withMessage('Campaign id is required'),
];

export const createCampaignValidators = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('campaignName').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('objective').optional().isString(),
  body('status').optional().isString(),
  body('platform').optional().isString().trim().isLength({ max: 80 }),
  body('budget').optional().isFloat({ min: 0 }),
  body('dailyBudget').optional({ nullable: true }).isFloat({ min: 0 }),
  body('startDate').optional({ nullable: true }).isISO8601().toDate(),
  body('endDate').optional({ nullable: true }).isISO8601().toDate(),
  body('adGroups').optional().isInt({ min: 0 }),
];

export const updateCampaignValidators = [
  ...campaignIdValidators,
  body('name').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('campaignName').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('objective').optional().isString(),
  body('status').optional().isString(),
  body('platform').optional().isString().trim().isLength({ max: 80 }),
  body('budget').optional().isFloat({ min: 0 }),
  body('dailyBudget').optional({ nullable: true }).isFloat({ min: 0 }),
  body('startDate').optional({ nullable: true }).isISO8601().toDate(),
  body('endDate').optional({ nullable: true }).isISO8601().toDate(),
  body('adGroups').optional().isInt({ min: 0 }),
];
