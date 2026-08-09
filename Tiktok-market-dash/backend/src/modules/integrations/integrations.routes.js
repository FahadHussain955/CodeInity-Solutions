import { Router } from 'express';
import { integrationsController } from './integrations.controller.js';
import {
  connectValidators,
  idValidators,
  logsValidators,
  updateValidators,
} from './integrations.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', integrationsController.list);
router.get('/status', integrationsController.status);
router.post('/connect', connectValidators, validateRequest, integrationsController.connect);

router.get('/:id', idValidators, validateRequest, integrationsController.getById);
router.patch('/:id', updateValidators, validateRequest, integrationsController.update);
router.delete('/:id', idValidators, validateRequest, integrationsController.disconnect);

router.post('/:id/sync', idValidators, validateRequest, integrationsController.sync);
router.get('/:id/sync', idValidators, validateRequest, integrationsController.lastSync);
router.get('/:id/sync/logs', logsValidators, validateRequest, integrationsController.syncLogs);

export default router;
