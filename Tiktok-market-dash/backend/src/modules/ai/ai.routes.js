import { Router } from 'express';
import { aiController } from './ai.controller.js';
import {
  generateInsightsValidators,
  insightsQueryValidators,
  refreshInsightsValidators,
} from './ai.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/insights', insightsQueryValidators, validateRequest, aiController.insights);
router.post(
  '/insights/generate',
  generateInsightsValidators,
  validateRequest,
  aiController.generate
);
router.post(
  '/insights/refresh',
  refreshInsightsValidators,
  validateRequest,
  aiController.refresh
);
router.get('/recommendations', aiController.recommendations);
router.get('/forecasts', aiController.forecasts);
router.get('/campaign-suggestions', aiController.campaignSuggestions);

export default router;
