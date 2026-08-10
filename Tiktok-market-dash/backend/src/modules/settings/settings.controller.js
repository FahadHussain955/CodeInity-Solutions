import { settingsService } from './settings.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const settingsController = {
  get: asyncHandler(async (req, res) => {
    const data = await settingsService.getOrCreate(req.user.id);
    return ApiResponse.success(res, { settings: data }, 'Settings');
  }),

  updateStore: asyncHandler(async (req, res) => {
    const data = await settingsService.updateStore(req.user.id, req.body);
    return ApiResponse.success(res, { settings: data }, 'Store settings updated');
  }),

  updateNotifications: asyncHandler(async (req, res) => {
    const data = await settingsService.updateNotifications(req.user.id, req.body);
    return ApiResponse.success(res, { settings: data }, 'Notification preferences updated');
  }),

  updateInventory: asyncHandler(async (req, res) => {
    const data = await settingsService.updateInventory(req.user.id, req.body);
    return ApiResponse.success(res, data, 'Inventory settings updated');
  }),

  billing: asyncHandler(async (req, res) => {
    const data = await settingsService.getBilling(req.user.id);
    return ApiResponse.success(res, data, 'Billing');
  }),

  security: asyncHandler(async (req, res) => {
    const data = await settingsService.getSecurity(req.user.id);
    return ApiResponse.success(res, data, 'Security');
  }),
};
