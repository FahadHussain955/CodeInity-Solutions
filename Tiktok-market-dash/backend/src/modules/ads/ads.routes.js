import { Router } from 'express';
import { adsController } from './ads.controller.js';
import {
  adIdValidators,
  adsListValidators,
  createAdValidators,
  reviewAdValidators,
  updateAdValidators,
} from './ads.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', adsListValidators, validateRequest, adsController.list);
router.get('/analytics', adsController.analytics);
router.post('/', createAdValidators, validateRequest, adsController.create);

router.get('/:id', adIdValidators, validateRequest, adsController.getById);
router.patch('/:id', updateAdValidators, validateRequest, adsController.update);
router.delete('/:id', adIdValidators, validateRequest, adsController.remove);
router.get('/:id/preview', adIdValidators, validateRequest, adsController.preview);
router.patch('/:id/review', reviewAdValidators, validateRequest, adsController.updateReview);

export default router;
