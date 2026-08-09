import { Router } from 'express';
import { activityController } from './activity.controller.js';
import { activityListValidators } from './activity.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', activityListValidators, validateRequest, activityController.list);

export default router;
