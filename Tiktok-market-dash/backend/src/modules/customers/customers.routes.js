import { Router } from 'express';
import { customersController } from './customers.controller.js';
import {
  createCustomerValidators,
  customerIdValidators,
  customersListValidators,
  updateCustomerValidators,
} from './customers.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', customersListValidators, validateRequest, customersController.list);
router.get('/analytics', customersController.analytics);
router.get('/dashboard', customersController.dashboard);
router.post('/', createCustomerValidators, validateRequest, customersController.create);

router.get('/:id', customerIdValidators, validateRequest, customersController.getById);
router.get(
  '/:id/orders',
  customerIdValidators,
  validateRequest,
  customersController.purchaseHistory
);
router.patch('/:id', updateCustomerValidators, validateRequest, customersController.update);
router.delete('/:id', customerIdValidators, validateRequest, customersController.remove);

export default router;
