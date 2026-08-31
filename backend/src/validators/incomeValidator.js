import { z } from 'zod';

export const createIncomeSchema = z.object({
  source: z.string().min(1, 'Source name is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  categoryId: z.string().optional(),
  note: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(['COMPLETED', 'PENDING', 'Completed', 'Pending']).optional()
});

export const updateIncomeSchema = createIncomeSchema.partial();
