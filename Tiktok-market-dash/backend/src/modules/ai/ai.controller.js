import { aiService } from './ai.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const aiController = {
  insights: asyncHandler(async (req, res) => {
    const data = await aiService.getInsights(req.user?.id);
    return ApiResponse.success(res, data, 'AI insights');
  }),

  generate: asyncHandler(async (req, res) => {
    const data = await aiService.generate(req.user?.id, req.body || {});
    return ApiResponse.success(res, data, 'AI insights generated');
  }),

  refresh: asyncHandler(async (req, res) => {
    const data = await aiService.refresh(req.user?.id, req.body || {});
    return ApiResponse.success(res, data, 'AI insights refreshed');
  }),

  recommendations: asyncHandler(async (req, res) => {
    const data = await aiService.recommendations(req.user?.id);
    return ApiResponse.success(res, data, 'AI recommendations');
  }),

  forecasts: asyncHandler(async (req, res) => {
    const data = await aiService.forecasts(req.user?.id);
    return ApiResponse.success(res, data, 'AI forecasts');
  }),

  campaignSuggestions: asyncHandler(async (req, res) => {
    const data = await aiService.campaignSuggestions(req.user?.id);
    return ApiResponse.success(res, data, 'Campaign suggestions');
  }),
};
