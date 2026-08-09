import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import {
  adjustStockValidators,
  bulkUpdateValidators,
  inventoryIdValidators,
  inventoryListValidators,
  markOutValidators,
  restockValidators,
  updateStockValidators,
} from './inventory.validators.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', inventoryListValidators, validateRequest, inventoryController.list);
router.get('/analytics', inventoryController.analytics);
router.get('/dashboard', inventoryController.dashboard);
router.post('/bulk', bulkUpdateValidators, validateRequest, inventoryController.bulkUpdate);

router.get('/:id', inventoryIdValidators, validateRequest, inventoryController.getById);
router.get('/:id/history', inventoryIdValidators, validateRequest, inventoryController.history);
router.patch('/:id/stock', updateStockValidators, validateRequest, inventoryController.updateStock);
router.post('/:id/adjust', adjustStockValidators, validateRequest, inventoryController.adjust);
router.post('/:id/restock', restockValidators, validateRequest, inventoryController.restock);
router.post('/:id/out-of-stock', markOutValidators, validateRequest, inventoryController.markOutOfStock);

export default router;
