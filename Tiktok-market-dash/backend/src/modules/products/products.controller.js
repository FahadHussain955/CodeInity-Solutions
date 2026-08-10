import { productsService } from './products.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const productsController = {
  list: asyncHandler(async (req, res) => {
    const data = await productsService.list(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Products list');
  }),

  categories: asyncHandler(async (req, res) => {
    const data = await productsService.categories(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Product categories');
  }),

  rankings: asyncHandler(async (req, res) => {
    const data = await productsService.rankings(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Product rankings');
  }),

  batchPerformance: asyncHandler(async (req, res) => {
    const data = await productsService.getBatchPerformance(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Products performance');
  }),

  getById: asyncHandler(async (req, res) => {
    const product = await productsService.getById(req.user.id, req.params.id);
    return ApiResponse.success(res, { product }, 'Product details');
  }),

  performance: asyncHandler(async (req, res) => {
    const data = await productsService.getPerformance(req.user.id, req.params.id, req.query);
    return ApiResponse.success(res, data, 'Product performance');
  }),

  create: asyncHandler(async (req, res) => {
    const product = await productsService.create(req.user.id, req.body);
    return ApiResponse.created(res, { product }, 'Product created');
  }),

  update: asyncHandler(async (req, res) => {
    const product = await productsService.update(req.user.id, req.params.id, req.body);
    return ApiResponse.success(res, { product }, 'Product updated');
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await productsService.remove(req.user.id, req.params.id);
    return ApiResponse.success(res, data, 'Product deleted');
  }),
};
