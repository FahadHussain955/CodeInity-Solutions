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

    if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 400;
      message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Uploaded file exceeds the size limit.'
          : err.message || 'Invalid file upload.';
      code = 'UPLOAD_ERROR';
      errors = [];
    } else if (prismaCode === 'P2002') {
      statusCode = 409;
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      message = `A record with this ${target} already exists.`;
      code = 'CONFLICT';
      errors = [];
    } else if (prismaCode === 'P2025') {
      statusCode = 404;
      message = 'Record not found.';
      code = 'NOT_FOUND';
      errors = [];
    } else if (isDbDown) {
      statusCode = 503;
      message =
        'Database unavailable. Start PostgreSQL and run migrations (see DEPLOYMENT_GUIDE.md).';
      code = 'DB_UNAVAILABLE';
      errors = [];
    } else if (msg.includes('Not allowed by CORS')) {
      statusCode = 403;
      message = 'Origin not allowed by CORS policy.';
      code = 'CORS_DENIED';
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
