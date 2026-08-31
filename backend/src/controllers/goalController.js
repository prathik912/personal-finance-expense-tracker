import * as goalService from '../services/goalService.js';
import { sendSuccess } from '../utils/response.js';

export const getGoals = async (req, res, next) => {
  try {
    const goals = await goalService.getSavingsGoals(req.user.id);
    return sendSuccess(res, 'Savings goals retrieved', goals);
  } catch (err) {
    next(err);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const goal = await goalService.createSavingsGoal(req.user.id, req.body);
    return sendSuccess(res, 'Savings goal created successfully', goal, 201);
  } catch (err) {
    next(err);
  }
};

export const getGoal = async (req, res, next) => {
  try {
    const goal = await goalService.getGoalById(req.user.id, req.params.id);
    return sendSuccess(res, 'Savings goal details fetched', goal);
  } catch (err) {
    next(err);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const updated = await goalService.updateSavingsGoal(req.user.id, req.params.id, req.body);
    return sendSuccess(res, 'Savings goal updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    await goalService.deleteSavingsGoal(req.user.id, req.params.id);
    return sendSuccess(res, 'Savings goal deleted successfully');
  } catch (err) {
    next(err);
  }
};
