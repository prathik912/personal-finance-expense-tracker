import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  category: z.string().optional(),
  targetAmount: z.number().positive('Target amount must be greater than zero'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').optional(),
  deadline: z.string().min(1, 'Target deadline is required'),
  icon: z.string().optional()
});

export const updateGoalSchema = createGoalSchema.partial();
