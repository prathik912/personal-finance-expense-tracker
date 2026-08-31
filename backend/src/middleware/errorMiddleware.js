import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  return sendError(res, message, err.errors || null, statusCode);
};
