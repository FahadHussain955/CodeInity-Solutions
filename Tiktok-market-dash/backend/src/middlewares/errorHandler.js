import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = Array.isArray(err.errors) ? err.errors : [];
  let code = err.code || 'INTERNAL_ERROR';

  if (!(err instanceof ApiError)) {
    // Prisma / driver style codes
    if (err.code === 'P1001' || err.code === 'ECONNREFUSED') {
      statusCode = 503;
      message = 'Database unavailable';
      code = 'DB_UNAVAILABLE';
    } else if (env.isProd) {
      message = 'Internal server error';
      code = 'INTERNAL_ERROR';
      errors = [];
    }
  }

  if (!env.isProd && statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    code,
    message,
    errors,
    ...(env.isProd ? {} : { stack: err.stack }),
  });
};
