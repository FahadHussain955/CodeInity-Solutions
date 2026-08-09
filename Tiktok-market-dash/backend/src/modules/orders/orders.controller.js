import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ordersService } from './orders.service.js';
import { refundsService } from './refunds.service.js';

export const listOrders = asyncHandler(async (req, res) => {
  const data = await ordersService.list(req.user.id, req.query);
  return ApiResponse.success(res, data, 'Orders retrieved.');
});

export const getOrder = asyncHandler(async (req, res) => {
  const data = await ordersService.getById(req.user.id, req.params.id);
  return ApiResponse.success(res, data, 'Order retrieved.');
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const data = await ordersService.updateStatus(req.user.id, req.params.id, req.body.status);
  return ApiResponse.success(res, data, 'Order status updated.');
});

export const listRefunds = asyncHandler(async (req, res) => {
  const data = await refundsService.listForOrder(req.user.id, req.params.id);
  return ApiResponse.success(res, data, 'Refunds retrieved.');
});

export const createRefund = asyncHandler(async (req, res) => {
  const data = await refundsService.create(req.user.id, req.params.id, req.body);
  return ApiResponse.created(res, data, 'Refund created.');
});

export const getRefund = asyncHandler(async (req, res) => {
  const data = await refundsService.getById(req.user.id, req.params.refundId);
  return ApiResponse.success(res, data, 'Refund retrieved.');
});
