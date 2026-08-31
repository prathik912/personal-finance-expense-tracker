import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/response.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.user.id);
    return sendSuccess(res, 'User profile fetched successfully', profile);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateUserProfile(req.user.id, req.body);
    return sendSuccess(res, 'User profile updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await userService.deleteUserAccount(req.user.id);
    return sendSuccess(res, 'User account and associated financial data deleted permanently');
  } catch (err) {
    next(err);
  }
};
