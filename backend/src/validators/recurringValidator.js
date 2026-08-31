import { z } from 'zod';

export const createRecurringSchema = z.object({
  name: z.string().min(1, 'Recurring expense name is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  categoryId: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  nextDueDate: z.string().min(1, 'Next due date is required'),
  description: z.string().optional()
});

export const updateRecurringSchema = createRecurringSchema.partial();
