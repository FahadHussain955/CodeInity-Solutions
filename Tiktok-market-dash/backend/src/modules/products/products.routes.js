import { Router } from 'express';
import { productsController } from './products.controller.js';
import {
  batchPerformanceValidators,
  createProductValidators,
  performanceValidators,
  productIdValidators,
  productsListValidators,
  rankingsValidators,
  updateProductValidators,
} from './products.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', productsListValidators, validateRequest, productsController.list);
router.get('/rankings', rankingsValidators, validateRequest, productsController.rankings);
router.get(
  '/performance',
  batchPerformanceValidators,
  validateRequest,
  productsController.batchPerformance
);
router.post('/', createProductValidators, validateRequest, productsController.create);

router.get('/:id', productIdValidators, validateRequest, productsController.getById);
router.get(
  '/:id/performance',
  performanceValidators,
  validateRequest,
  productsController.performance
);
router.patch('/:id', updateProductValidators, validateRequest, productsController.update);
router.delete('/:id', productIdValidators, validateRequest, productsController.remove);

export default router;
