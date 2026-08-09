import { inventoryService } from './inventory.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const inventoryController = {
  list: asyncHandler(async (req, res) => {
    const data = await inventoryService.list(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Inventory list');
  }),

  analytics: asyncHandler(async (req, res) => {
    const data = await inventoryService.analytics(req.user.id);
    return ApiResponse.success(res, data, 'Inventory analytics');
  }),

  dashboard: asyncHandler(async (req, res) => {
    const data = await inventoryService.dashboardSummary(req.user.id);
    return ApiResponse.success(res, data, 'Inventory dashboard');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await inventoryService.getById(req.user.id, req.params.id);
    return ApiResponse.success(res, { item: data }, 'Inventory record');
  }),

  updateStock: asyncHandler(async (req, res) => {
    await inventoryService.getById(req.user.id, req.params.id);
    const data = await inventoryService.updateStock(req.params.id, req.body, req.user?.id);
    return ApiResponse.success(res, { item: data }, 'Stock updated');
  }),

  adjust: asyncHandler(async (req, res) => {
    await inventoryService.getById(req.user.id, req.params.id);
    const data = await inventoryService.adjustStock(req.params.id, req.body, req.user?.id);
    return ApiResponse.success(res, { item: data }, 'Stock adjusted');
  }),

  restock: asyncHandler(async (req, res) => {
    await inventoryService.getById(req.user.id, req.params.id);
    const data = await inventoryService.restock(req.params.id, req.body, req.user?.id);
    return ApiResponse.success(res, { item: data }, 'Product restocked');
  }),

  markOutOfStock: asyncHandler(async (req, res) => {
    await inventoryService.getById(req.user.id, req.params.id);
    const data = await inventoryService.markOutOfStock(req.params.id, req.body, req.user?.id);
    return ApiResponse.success(res, { item: data }, 'Marked out of stock');
  }),

  bulkUpdate: asyncHandler(async (req, res) => {
    const data = await inventoryService.bulkUpdate(req.body.updates, req.user?.id);
    return ApiResponse.success(res, data, 'Bulk stock update complete');
  }),

  history: asyncHandler(async (req, res) => {
    await inventoryService.getById(req.user.id, req.params.id);
    const data = await inventoryService.history(req.params.id, req.query);
    return ApiResponse.success(res, data, 'Stock movement history');
  }),
};
