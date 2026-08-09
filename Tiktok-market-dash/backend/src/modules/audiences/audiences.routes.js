import { Router } from 'express';
import { audiencesController } from './audiences.controller.js';
import {
  audienceIdValidators,
  audiencesListValidators,
  createAudienceValidators,
  updateAudienceValidators,
} from './audiences.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', audiencesListValidators, validateRequest, audiencesController.list);
router.get('/analytics', audiencesController.analytics);
router.post('/', createAudienceValidators, validateRequest, audiencesController.create);

router.get('/:id', audienceIdValidators, validateRequest, audiencesController.getById);
router.patch('/:id', updateAudienceValidators, validateRequest, audiencesController.update);
router.delete('/:id', audienceIdValidators, validateRequest, audiencesController.remove);

export default router;
