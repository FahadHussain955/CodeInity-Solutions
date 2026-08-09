import { param, query } from 'express-validator';

export const notificationsListValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('unread').optional().isIn(['true', 'false', '1', '0']),
  query('type').optional().isString().trim(),
];

export const notificationIdValidators = [
  param('id').isString().notEmpty().withMessage('Notification id is required'),
];
