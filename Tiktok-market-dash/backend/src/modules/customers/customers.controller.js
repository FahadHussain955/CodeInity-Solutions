import { customersService } from './customers.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

export const customersController = {
  list: asyncHandler(async (req, res) => {
    const data = await customersService.list(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Customers list');
  }),

  analytics: asyncHandler(async (req, res) => {
    const data = await customersService.analytics(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Customer analytics');
  }),

  dashboard: asyncHandler(async (req, res) => {
    const data = await customersService.dashboardSummary(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Customer dashboard');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await customersService.getById(req.user.id, req.params.id);
    return ApiResponse.success(res, { customer: data }, 'Customer details');
  }),

  create: asyncHandler(async (req, res) => {
    if (!req.body.fullName && !req.body.name) {
      throw ApiError.badRequest('fullName is required.');
    }
    const data = await customersService.create(req.user.id, req.body);
    return ApiResponse.created(res, { customer: data }, 'Customer created');
  }),

  update: asyncHandler(async (req, res) => {
    const data = await customersService.update(req.user.id, req.params.id, req.body);
    return ApiResponse.success(res, { customer: data }, 'Customer updated');
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await customersService.remove(req.user.id, req.params.id);
    return ApiResponse.success(res, data, 'Customer removed');
  }),

  purchaseHistory: asyncHandler(async (req, res) => {
    const data = await customersService.purchaseHistory(req.user.id, req.params.id, req.query);
    return ApiResponse.success(res, data, 'Purchase history');
  }),
};
