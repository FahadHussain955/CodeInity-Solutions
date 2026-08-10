import { adsService } from './ads.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

export const adsController = {
  list: asyncHandler(async (req, res) => {
    const data = await adsService.list(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Ads list');
  }),

  analytics: asyncHandler(async (req, res) => {
    const data = await adsService.analytics(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Ads analytics');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await adsService.getById(req.user.id, req.params.id);
    return ApiResponse.success(res, { ad: data }, 'Ad details');
  }),

  create: asyncHandler(async (req, res) => {
    if (!req.body.name && !req.body.title) {
      throw ApiError.badRequest('Ad title is required.');
    }
    if (!req.body.campaignId) {
      throw ApiError.badRequest('campaignId is required.');
    }
    const data = await adsService.create(req.user.id, req.body);
    return ApiResponse.created(res, { ad: data }, 'Ad created');
  }),

  update: asyncHandler(async (req, res) => {
    const data = await adsService.update(req.user.id, req.params.id, req.body);
    return ApiResponse.success(res, { ad: data }, 'Ad updated');
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await adsService.remove(req.user.id, req.params.id);
    return ApiResponse.success(res, data, 'Ad removed');
  }),

  preview: asyncHandler(async (req, res) => {
    const data = await adsService.preview(req.user.id, req.params.id);
    return ApiResponse.success(res, { ad: data }, 'Ad preview');
  }),

  updateReview: asyncHandler(async (req, res) => {
    const data = await adsService.updateReviewStatus(req.user.id, req.params.id, req.body);
    return ApiResponse.success(res, { ad: data }, 'Review status updated');
  }),
};
