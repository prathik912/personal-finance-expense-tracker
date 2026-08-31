import * as budgetService from '../services/budgetService.js';
import { sendSuccess } from '../utils/response.js';

export const getBudgetCategories = async (req, res, next) => {
  try {
    const categories = await budgetService.getBudgetCategories(req.user.id);
    return sendSuccess(res, 'Budget categories retrieved', categories);
  } catch (err) {
    next(err);
  }
};

export const createBudgetCategory = async (req, res, next) => {
  try {
    const category = await budgetService.createBudgetCategory(req.user.id, req.body);
    return sendSuccess(res, 'Budget category created successfully', category, 201);
  } catch (err) {
    next(err);
  }
};

export const getBudgetAdjustments = async (req, res, next) => {
  try {
    const adjustments = await budgetService.getBudgetAdjustments(req.user.id);
    return sendSuccess(res, 'Budget adjustments fetched', adjustments);
  } catch (err) {
    next(err);
  }
};
