import * as expenseService from '../services/expenseService.js';
import { sendSuccess } from '../utils/response.js';

export const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await expenseService.getExpenses(req.user.id, req.query);
    return sendSuccess(res, 'Expenses retrieved successfully', expenses);
  } catch (err) {
    next(err);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.user.id, req.body);
    return sendSuccess(res, 'Expense created successfully', expense, 201);
  } catch (err) {
    next(err);
  }
};

export const getExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.user.id, req.params.id);
    return sendSuccess(res, 'Expense details fetched', expense);
  } catch (err) {
    next(err);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const updated = await expenseService.updateExpense(req.user.id, req.params.id, req.body);
    return sendSuccess(res, 'Expense updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.user.id, req.params.id);
    return sendSuccess(res, 'Expense deleted successfully');
  } catch (err) {
    next(err);
  }
};
