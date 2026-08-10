import { body } from 'express-validator';

export const updateStoreValidators = [
  body('storeName').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('storeUrl').optional().isString().trim().isLength({ max: 200 }),
  body('businessName').optional({ nullable: true }).isString().trim().isLength({ max: 120 }),
  body('contactEmail').optional({ nullable: true }).isEmail().normalizeEmail(),
  body('contactPhone').optional({ nullable: true }).isString().trim().isLength({ max: 40 }),
  body('addressLine1').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
  body('addressLine2').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
  body('city').optional({ nullable: true }).isString().trim().isLength({ max: 80 }),
  body('country').optional({ nullable: true }).isString().trim().isLength({ max: 80 }),
  body('timezone').optional().isString().trim().isLength({ max: 80 }),
  body('currency').optional().isString().trim().isLength({ min: 3, max: 8 }),
  body('description').optional({ nullable: true }).isString().trim().isLength({ max: 1000 }),
  body('store').optional().isObject(),
];

export const updateNotificationValidators = [
  body('orders').optional().isBoolean(),
  body('inventory').optional().isBoolean(),
  body('customers').optional().isBoolean(),
  body('marketing').optional().isBoolean(),
  body('campaign').optional().isBoolean(),
  body('ai').optional().isBoolean(),
  body('email').optional().isBoolean(),
  body('orderNotifications').optional().isBoolean(),
  body('lowStockAlerts').optional().isBoolean(),
  body('customerNotifications').optional().isBoolean(),
  body('marketingEmails').optional().isBoolean(),
  body('campaignNotifications').optional().isBoolean(),
  body('aiNotifications').optional().isBoolean(),
  body('emailNotifications').optional().isBoolean(),
  body('notifications').optional().isObject(),
];

export const updateInventoryValidators = [
  body('lowStockThreshold').optional().isInt({ min: 1, max: 10000 }),
  body('threshold').optional().isInt({ min: 1, max: 10000 }),
  body('inventory').optional().isObject(),
];
