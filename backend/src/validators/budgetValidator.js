import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  amount: z.number().positive('Monthly limit must be greater than zero'),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).optional()
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  limit: z.number().positive('Monthly limit must be greater than zero'),
  icon: z.string().optional(),
  color: z.string().optional()
});

export const updateBudgetSchema = createBudgetSchema.partial();
