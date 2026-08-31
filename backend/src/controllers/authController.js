import * as authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, 'User registered successfully', result, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, 'User authenticated successfully', result, 200);
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Current user profile retrieved', { user: req.user }, 200);
  } catch (err) {
    next(err);
  }
};
