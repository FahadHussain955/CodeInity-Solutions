import { Router } from 'express';
import healthRoutes from '../../modules/health/health.routes.js';
import authRoutes from '../../modules/auth/auth.routes.js';
import inventoryRoutes from '../../modules/inventory/inventory.routes.js';
import customersRoutes from '../../modules/customers/customers.routes.js';
import dashboardRoutes from '../../modules/dashboard/dashboard.routes.js';
import integrationsRoutes from '../../modules/integrations/integrations.routes.js';
import campaignsRoutes from '../../modules/campaigns/campaigns.routes.js';
import adsRoutes from '../../modules/ads/ads.routes.js';
import audiencesRoutes from '../../modules/audiences/audiences.routes.js';
import aiRoutes from '../../modules/ai/ai.routes.js';
import settingsRoutes from '../../modules/settings/settings.routes.js';
import notificationsRoutes from '../../modules/notifications/notifications.routes.js';
import activityRoutes from '../../modules/activity/activity.routes.js';
import uploadsRoutes from '../../modules/uploads/uploads.routes.js';
import productsRoutes from '../../modules/products/products.routes.js';
import ordersRoutes from '../../modules/orders/orders.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/customers', customersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/integrations', integrationsRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/ads', adsRoutes);
router.use('/audiences', audiencesRoutes);
router.use('/ai', aiRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/activity', activityRoutes);
router.use('/uploads', uploadsRoutes);

export default router;
