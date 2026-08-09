import { activityService } from './activity.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const activityController = {
  list: asyncHandler(async (req, res) => {
    const data = await activityService.list(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Activity');
  }),
};
