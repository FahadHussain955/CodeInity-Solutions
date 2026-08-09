import { Router } from 'express';
import { aiController } from './ai.controller.js';
import {
  generateInsightsValidators,
  generateProductValidators,
  insightsQueryValidators,
  refreshInsightsValidators,
} from './ai.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { memoryUpload } from '../uploads/uploads.service.js';

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

router.post(
  '/products/generate',
  (req, res, next) => {
    const contentType = String(req.headers['content-type'] || '');
    if (contentType.includes('multipart/form-data')) {
      return memoryUpload.single('image')(req, res, (err) => {
        if (err) return next(err);
        return next();
      });
    }
    return next();
  },
  generateProductValidators,
  validateRequest,
  aiController.generateProduct
);

export default router;
