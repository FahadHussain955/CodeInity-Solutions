import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = Array.isArray(err.errors) ? err.errors : [];
  let code = err.code || 'INTERNAL_ERROR';

  if (!(err instanceof ApiError)) {
    const prismaCode = err.code;
    const msg = String(err.message || '');
    const isDbDown =
      prismaCode === 'P1001' ||
      prismaCode === 'P1017' ||
      prismaCode === 'ECONNREFUSED' ||
      msg.includes('ECONNREFUSED') ||
      msg.includes("Can't reach database server") ||
      msg.includes('connect ECONNREFUSED');

    if (isDbDown) {
      statusCode = 503;
      message =
        'Database unavailable. Start PostgreSQL and run migrations (see AUTHENTICATION_DOCUMENTATION.md).';
      code = 'DB_UNAVAILABLE';
      errors = [];
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
