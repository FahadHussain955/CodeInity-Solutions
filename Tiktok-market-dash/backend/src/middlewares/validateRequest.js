import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Runs after express-validator chains. Forwards a 400 ApiError on failure.
 */
export const validateRequest = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((item) => ({
    field: item.path || item.param,
    message: item.msg,
  }));

  return next(ApiError.badRequest('Validation failed', errors));
};
