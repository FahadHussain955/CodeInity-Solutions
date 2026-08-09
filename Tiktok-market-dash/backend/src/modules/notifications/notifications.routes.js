import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import {
  notificationIdValidators,
  notificationsListValidators,
} from './notifications.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationsListValidators, validateRequest, notificationsController.list);
router.get('/unread-count', notificationsController.unreadCount);
router.patch(
  '/:id/read',
  notificationIdValidators,
  validateRequest,
  notificationsController.markRead
);
router.post('/read-all', notificationsController.markAllRead);
router.delete(
  '/:id',
  notificationIdValidators,
  validateRequest,
  notificationsController.remove
);

export default router;
