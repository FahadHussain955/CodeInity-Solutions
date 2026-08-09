import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import * as ctrl from './orders.controller.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().isLength({ max: 200 }),
    query('status').optional().isString().isLength({ max: 40 }),
    query('filter').optional().isString().isLength({ max: 40 }),
  ],
  validateRequest,
  ctrl.listOrders
);

// Static path before /:id to avoid collision
router.get(
  '/refund/:refundId',
  [param('refundId').isString().notEmpty().isLength({ max: 80 })],
  validateRequest,
  ctrl.getRefund
);

router.get(
  '/:id',
  [param('id').isString().notEmpty().isLength({ max: 80 })],
  validateRequest,
  ctrl.getOrder
);

router.patch(
  '/:id/status',
  [
    param('id').isString().notEmpty().isLength({ max: 80 }),
    body('status')
      .isString()
      .isIn(['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'UNDER_REVIEW', 'REFUNDED']),
  ],
  validateRequest,
  ctrl.updateOrderStatus
);

router.get(
  '/:id/refunds',
  [param('id').isString().notEmpty().isLength({ max: 80 })],
  validateRequest,
  ctrl.listRefunds
);

router.post(
  '/:id/refunds',
  [
    param('id').isString().notEmpty().isLength({ max: 80 }),
    body('amount').exists().withMessage('amount is required'),
    body('reason').optional({ nullable: true }).isString().isLength({ max: 500 }),
  ],
  validateRequest,
  ctrl.createRefund
);

export default router;
