import * as incomeService from '../services/incomeService.js';
import { sendSuccess } from '../utils/response.js';

export const getAllIncomes = async (req, res, next) => {
  try {
    const incomes = await incomeService.getIncomes(req.user.id);
    return sendSuccess(res, 'Incomes retrieved successfully', incomes);
  } catch (err) {
    next(err);
  }
};

export const createIncome = async (req, res, next) => {
  try {
    const income = await incomeService.createIncome(req.user.id, req.body);
    return sendSuccess(res, 'Income created successfully', income, 201);
  } catch (err) {
    next(err);
  }
};

export const getIncome = async (req, res, next) => {
  try {
    const income = await incomeService.getIncomeById(req.user.id, req.params.id);
    return sendSuccess(res, 'Income details fetched', income);
  } catch (err) {
    next(err);
  }
};

export const updateIncome = async (req, res, next) => {
  try {
    const updated = await incomeService.updateIncome(req.user.id, req.params.id, req.body);
    return sendSuccess(res, 'Income updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

export const deleteIncome = async (req, res, next) => {
  try {
    await incomeService.deleteIncome(req.user.id, req.params.id);
    return sendSuccess(res, 'Income deleted successfully');
  } catch (err) {
    next(err);
  }
};
