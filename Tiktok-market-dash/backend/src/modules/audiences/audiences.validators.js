import { body, param, query } from 'express-validator';

export const audiencesListValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim(),
  query('status').optional().isString(),
  query('filter').optional().isString(),
  query('type').optional().isString(),
  query('sort').optional().isString(),
];

export const audienceIdValidators = [
  param('id').isString().notEmpty().withMessage('Audience id is required'),
];

export const createAudienceValidators = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('audienceName').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('type').optional().isString(),
  body('status').optional().isString(),
  body('gender').optional({ nullable: true }).isString().trim(),
  body('ageRange').optional({ nullable: true }).isString().trim(),
  body('countries').optional().isArray(),
  body('interests').optional().isArray(),
  body('size').optional({ nullable: true }).isString(),
  body('estimatedReach').optional({ nullable: true }).isString(),
  body('source').optional({ nullable: true }).isString().trim(),
  body('match').optional().isInt({ min: 0, max: 100 }),
  body('matchScore').optional().isInt({ min: 0, max: 100 }),
];

export const updateAudienceValidators = [
  ...audienceIdValidators,
  body('name').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('audienceName').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('type').optional().isString(),
  body('status').optional().isString(),
  body('gender').optional({ nullable: true }).isString().trim(),
  body('ageRange').optional({ nullable: true }).isString().trim(),
  body('countries').optional().isArray(),
  body('interests').optional().isArray(),
  body('size').optional({ nullable: true }).isString(),
  body('estimatedReach').optional({ nullable: true }).isString(),
  body('source').optional({ nullable: true }).isString().trim(),
  body('match').optional().isInt({ min: 0, max: 100 }),
  body('matchScore').optional().isInt({ min: 0, max: 100 }),
];
