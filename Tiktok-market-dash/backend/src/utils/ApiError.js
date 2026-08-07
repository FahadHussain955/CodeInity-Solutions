export class ApiError extends Error {
  constructor(statusCode, message, errors = [], code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
    this.success = false;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors, 'BAD_REQUEST');
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, [], 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, [], 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, [], 'NOT_FOUND');
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message, [], 'CONFLICT');
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], 'INTERNAL_ERROR');
  }
}
