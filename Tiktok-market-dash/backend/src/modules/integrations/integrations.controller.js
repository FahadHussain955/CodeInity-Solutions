import { integrationsService } from './integrations.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

export const integrationsController = {
  list: asyncHandler(async (req, res) => {
    const data = await integrationsService.list(req.user.id);
    return ApiResponse.success(res, { items: data }, 'Connected stores');
  }),

  status: asyncHandler(async (req, res) => {
    const data = await integrationsService.status(req.user.id);
    return ApiResponse.success(res, data, 'Integration status');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await integrationsService.getById(req.user.id, req.params.id);
    return ApiResponse.success(res, { store: data }, 'Store integration');
  }),

  connect: asyncHandler(async (req, res) => {
    if (!req.body.platform && !req.body.provider) {
      req.body.platform = 'TikTok Shop';
    }
    if (!req.body.storeUrl && !req.body.url) {
      throw ApiError.badRequest('Store URL is required.');
    }
    if (!req.body.storeName && !req.body.name) {
      throw ApiError.badRequest('Store name is required.');
    }
    const data = await integrationsService.connect(req.user.id, req.body);
    return ApiResponse.created(res, { store: data }, 'TikTok Shop connected');
  }),

  update: asyncHandler(async (req, res) => {
    const data = await integrationsService.update(req.user.id, req.params.id, req.body);
    return ApiResponse.success(res, { store: data }, 'Store updated');
  }),

  disconnect: asyncHandler(async (req, res) => {
    const data = await integrationsService.disconnect(req.user.id, req.params.id);
    return ApiResponse.success(res, data, 'Store disconnected');
  }),

  sync: asyncHandler(async (req, res) => {
    const data = await integrationsService.sync(req.user.id, req.params.id);
    return ApiResponse.success(res, data, 'Store sync completed');
  }),

  lastSync: asyncHandler(async (req, res) => {
    const data = await integrationsService.lastSync(req.user.id, req.params.id);
    return ApiResponse.success(res, data, 'Last sync details');
  }),

  syncLogs: asyncHandler(async (req, res) => {
    const data = await integrationsService.syncLogs(req.user.id, req.params.id, req.query);
    return ApiResponse.success(res, data, 'Sync logs');
  }),
};
