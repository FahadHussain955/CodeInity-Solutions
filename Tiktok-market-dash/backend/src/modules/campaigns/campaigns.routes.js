import { Router } from 'express';
import { campaignsController } from './campaigns.controller.js';
import {
  campaignIdValidators,
  campaignsListValidators,
  createCampaignValidators,
  updateCampaignValidators,
} from './campaigns.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', campaignsListValidators, validateRequest, campaignsController.list);
router.get('/analytics', campaignsController.analytics);
router.post('/', createCampaignValidators, validateRequest, campaignsController.create);

router.get('/:id', campaignIdValidators, validateRequest, campaignsController.getById);
router.patch('/:id', updateCampaignValidators, validateRequest, campaignsController.update);
router.delete('/:id', campaignIdValidators, validateRequest, campaignsController.remove);
router.post(
  '/:id/duplicate',
  campaignIdValidators,
  validateRequest,
  campaignsController.duplicate
);

export default router;
