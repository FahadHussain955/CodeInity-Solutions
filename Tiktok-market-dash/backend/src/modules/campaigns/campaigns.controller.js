import { campaignsService } from './campaigns.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

export const campaignsController = {
  list: asyncHandler(async (req, res) => {
    const data = await campaignsService.list(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Campaigns list');
  }),

  analytics: asyncHandler(async (req, res) => {
    const data = await campaignsService.analytics(req.user.id);
    return ApiResponse.success(res, data, 'Campaign analytics');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await campaignsService.getById(req.user.id, req.params.id);
    return ApiResponse.success(res, { campaign: data }, 'Campaign details');
  }),

  create: asyncHandler(async (req, res) => {
    if (!req.body.name && !req.body.campaignName) {
      throw ApiError.badRequest('Campaign name is required.');
    }
    const data = await campaignsService.create(req.user.id, req.body);
    return ApiResponse.created(res, { campaign: data }, 'Campaign created');
  }),

  update: asyncHandler(async (req, res) => {
    const data = await campaignsService.update(req.user.id, req.params.id, req.body);
    return ApiResponse.success(res, { campaign: data }, 'Campaign updated');
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await campaignsService.remove(req.user.id, req.params.id);
    return ApiResponse.success(res, data, 'Campaign removed');
  }),

  duplicate: asyncHandler(async (req, res) => {
    const data = await campaignsService.duplicate(req.user.id, req.params.id);
    return ApiResponse.created(res, { campaign: data }, 'Campaign duplicated');
  }),
};
