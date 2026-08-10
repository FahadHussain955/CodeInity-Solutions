import { body, param, query } from 'express-validator';

export const adsListValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim(),
  query('status').optional().isString(),
  query('reviewStatus').optional().isString(),
  query('filter').optional().isString(),
  query('campaignId').optional().isString(),
  query('sort').optional().isString(),
];

export const adIdValidators = [
  param('id').isString().notEmpty().withMessage('Ad id is required'),
];

export const createAdValidators = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('title').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body().custom((_, { req }) => {
    const title = String(req.body?.name || req.body?.title || '').trim();
    if (title.length < 2) {
      throw new Error('Ad title is required (min 2 characters).');
    }
    return true;
  }),
  body('campaignId').isString().notEmpty().withMessage('campaignId is required'),
  body('format').optional().isString().trim(),
  body('mediaType').optional().isString().trim(),
  body('mediaUrl').optional({ nullable: true }).isString(),
  body('thumbnail').optional({ nullable: true }).isString(),
  body('caption').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('adGroup').optional({ nullable: true }).isString().trim(),
  body('duration').optional({ nullable: true }).isString().trim(),
];

export const updateAdValidators = [
  ...adIdValidators,
  body('name').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('title').optional().isString().trim().isLength({ min: 2, max: 200 }),
  body('campaignId').optional().isString(),
  body('format').optional().isString().trim(),
  body('mediaType').optional().isString().trim(),
  body('mediaUrl').optional({ nullable: true }).isString(),
  body('thumbnail').optional({ nullable: true }).isString(),
  body('caption').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('adGroup').optional({ nullable: true }).isString().trim(),
  body('duration').optional({ nullable: true }).isString().trim(),
  body('status').optional().isString(),
  body('reviewStatus').optional().isString(),
];

export const reviewAdValidators = [
  ...adIdValidators,
  body('reviewStatus').optional().isString(),
  body('status').optional().isString(),
];
