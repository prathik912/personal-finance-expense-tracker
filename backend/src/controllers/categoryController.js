import * as categoryService from '../services/categoryService.js';
import { sendSuccess } from '../utils/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories(req.user.id);
    return sendSuccess(res, 'Categories fetched successfully', categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.user.id, req.body);
    return sendSuccess(res, 'Category created successfully', category, 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const updated = await categoryService.updateCategory(req.user.id, req.params.id, req.body);
    return sendSuccess(res, 'Category updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.user.id, req.params.id);
    return sendSuccess(res, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
};
