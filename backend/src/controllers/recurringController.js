import * as recurringService from '../services/recurringService.js';
import { sendSuccess } from '../utils/response.js';

export const getRecurring = async (req, res, next) => {
  try {
    const items = await recurringService.getRecurringExpenses(req.user.id);
    return sendSuccess(res, 'Recurring expenses fetched', items);
  } catch (err) {
    next(err);
  }
};

export const createRecurring = async (req, res, next) => {
  try {
    const item = await recurringService.createRecurringExpense(req.user.id, req.body);
    return sendSuccess(res, 'Recurring expense created', item, 201);
  } catch (err) {
    next(err);
  }
};

export const updateRecurring = async (req, res, next) => {
  try {
    const updated = await recurringService.updateRecurringExpense(req.user.id, req.params.id, req.body);
    return sendSuccess(res, 'Recurring expense updated', updated);
  } catch (err) {
    next(err);
  }
};

export const deleteRecurring = async (req, res, next) => {
  try {
    await recurringService.deleteRecurringExpense(req.user.id, req.params.id);
    return sendSuccess(res, 'Recurring expense deleted');
  } catch (err) {
    next(err);
  }
};
