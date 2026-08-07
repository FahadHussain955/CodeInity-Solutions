import { healthService } from './health.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const healthController = {
  check: asyncHandler(async (_req, res) => {
    const data = await healthService.getStatus();
    const statusCode = data.status === 'ok' ? 200 : 503;
    return ApiResponse.success(res, data, 'Health check', statusCode);
  }),
};
