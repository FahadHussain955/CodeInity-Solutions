import { dashboardService } from './dashboard.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const dashboardController = {
  overview: asyncHandler(async (req, res) => {
    const data = await dashboardService.getOverview(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Dashboard overview');
  }),

  kpis: asyncHandler(async (req, res) => {
    const data = await dashboardService.getKpis(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Dashboard KPIs');
  }),

  revenue: asyncHandler(async (req, res) => {
    const data = await dashboardService.getRevenue(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Revenue analytics');
  }),

  sales: asyncHandler(async (req, res) => {
    const data = await dashboardService.getSales(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Sales analytics');
  }),

  productInsights: asyncHandler(async (req, res) => {
    const data = await dashboardService.getProductInsights(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Product insights');
  }),

  customerInsights: asyncHandler(async (req, res) => {
    const data = await dashboardService.getCustomerInsights(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Customer insights');
  }),

  recentOrders: asyncHandler(async (req, res) => {
    const data = await dashboardService.getRecentOrders(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Recent orders');
  }),

  activity: asyncHandler(async (req, res) => {
    const data = await dashboardService.getActivity(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Recent activity');
  }),

  storeHealth: asyncHandler(async (req, res) => {
    const data = await dashboardService.getStoreHealth(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Store health');
  }),
};
