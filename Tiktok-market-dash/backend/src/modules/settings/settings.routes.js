import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import {
  updateNotificationValidators,
  updateStoreValidators,
} from './settings.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', settingsController.get);
router.patch('/store', updateStoreValidators, validateRequest, settingsController.updateStore);
router.patch(
  '/notifications',
  updateNotificationValidators,
  validateRequest,
  settingsController.updateNotifications
);
router.get('/billing', settingsController.billing);
router.get('/security', settingsController.security);

export default router;
