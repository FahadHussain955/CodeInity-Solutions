import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { dashboardRangeValidators } from './dashboard.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', dashboardRangeValidators, validateRequest, dashboardController.overview);
router.get('/kpis', dashboardRangeValidators, validateRequest, dashboardController.kpis);
router.get('/revenue', dashboardRangeValidators, validateRequest, dashboardController.revenue);
router.get('/sales', dashboardRangeValidators, validateRequest, dashboardController.sales);
router.get('/product-insights', dashboardController.productInsights);
router.get(
  '/customer-insights',
  dashboardRangeValidators,
  validateRequest,
  dashboardController.customerInsights
);
router.get(
  '/recent-orders',
  dashboardRangeValidators,
  validateRequest,
  dashboardController.recentOrders
);
router.get('/activity', dashboardRangeValidators, validateRequest, dashboardController.activity);
router.get('/store-health', dashboardController.storeHealth);

export default router;
