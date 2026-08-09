import { audiencesService } from './audiences.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

export const audiencesController = {
  list: asyncHandler(async (req, res) => {
    const data = await audiencesService.list(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Audiences list');
  }),

  analytics: asyncHandler(async (req, res) => {
    const data = await audiencesService.analytics(req.user.id);
    return ApiResponse.success(res, data, 'Audience analytics');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await audiencesService.getById(req.user.id, req.params.id);
    return ApiResponse.success(res, { audience: data }, 'Audience details');
  }),

  create: asyncHandler(async (req, res) => {
    if (!req.body.name && !req.body.audienceName) {
      throw ApiError.badRequest('Audience name is required.');
    }
    const data = await audiencesService.create(req.user.id, req.body);
    return ApiResponse.created(res, { audience: data }, 'Audience created');
  }),

  update: asyncHandler(async (req, res) => {
    const data = await audiencesService.update(req.user.id, req.params.id, req.body);
    return ApiResponse.success(res, { audience: data }, 'Audience updated');
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await audiencesService.remove(req.user.id, req.params.id);
    return ApiResponse.success(res, data, 'Audience removed');
  }),
};
