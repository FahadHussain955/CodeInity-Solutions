import { body, param, query } from 'express-validator';

const STOCK_STATUSES = ['all', 'in_stock', 'low_stock', 'out_of_stock'];
const SORT_FIELDS = ['updated', 'name', 'price', 'sku', 'stock', 'created'];
const SORT_ORDERS = ['asc', 'desc'];

export const productsListValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim().isLength({ max: 120 }),
  query('status').optional().isString(),
  query('filter').optional().isString(),
  query('category').optional().isString().trim().isLength({ max: 120 }),
  query('minPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  query('maxPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  query('stockStatus')
    .optional()
    .isString()
    .customSanitizer((v) => String(v || '').toLowerCase())
    .isIn(STOCK_STATUSES),
  query('shopId').optional().isString().trim().isLength({ max: 64 }),
  query('sortBy')
    .optional()
    .isString()
    .customSanitizer((v) => String(v || '').toLowerCase())
    .isIn(SORT_FIELDS),
  query('sortOrder')
    .optional()
    .isString()
    .customSanitizer((v) => String(v || '').toLowerCase())
    .isIn(SORT_ORDERS),
  query('sort').optional().isString(),
  query('range').optional().isString(),
  query('start').optional().isISO8601(),
  query('end').optional().isISO8601(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

export const productsCategoriesValidators = [
  query('shopId').optional().isString().trim().isLength({ max: 64 }),
];

export const productIdValidators = [
  param('id').isString().trim().notEmpty().withMessage('Product id is required'),
];

export const createProductValidators = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }),
  body('sku').trim().notEmpty().withMessage('SKU is required').isLength({ max: 80 }),
  body('category').optional().isString().trim().isLength({ max: 120 }),
  body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }),
  body('costPrice').optional({ nullable: true }).isFloat({ min: 0 }),
  body('cost').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('reorderPoint').optional().isInt({ min: 0 }),
  body('status').optional().isString(),
  body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('image').optional({ nullable: true }).isString().isLength({ max: 500 }),
  body('shopId').optional().isString().trim().isLength({ max: 64 }),
  body('storeIntegrationId').optional().isString().trim().isLength({ max: 64 }),
];

export const updateProductValidators = [
  ...productIdValidators,
  body('name').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('sku').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('category').optional().isString().trim().isLength({ max: 120 }),
  body('price').optional().isFloat({ min: 0 }),
  body('costPrice').optional({ nullable: true }).isFloat({ min: 0 }),
  body('cost').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('reorderPoint').optional().isInt({ min: 0 }),
  body('status').optional().isString(),
  body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('image').optional({ nullable: true }).isString().isLength({ max: 500 }),
];

export const performanceValidators = [
  ...productIdValidators,
  query('range').optional().isString(),
  query('start').optional().isISO8601(),
  query('end').optional().isISO8601(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

export const batchPerformanceValidators = [
  query('ids').optional().isString(),
  query('range').optional().isString(),
  query('start').optional().isISO8601(),
  query('end').optional().isISO8601(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

export const rankingsValidators = [
  query('metric').optional().isIn(['units', 'revenue', 'profit', 'margin', 'worst']),
  query('limit').optional().isInt({ min: 1, max: 20 }),
  query('range').optional().isString(),
  query('start').optional().isISO8601(),
  query('end').optional().isISO8601(),
  query('shopId').optional().isString().trim().isLength({ max: 64 }),
];
