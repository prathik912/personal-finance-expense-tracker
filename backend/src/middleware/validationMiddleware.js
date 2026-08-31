import { sendError } from '../utils/response.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return sendError(res, 'Validation failed for request data', formattedErrors, 400);
    }
    req.body = result.data;
    next();
  };
};
