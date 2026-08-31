import { z } from 'zod';

export const createExpenseSchema = z.object({
  merchant: z.string().min(1, 'Merchant name is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  note: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(['COMPLETED', 'PENDING', 'Completed', 'Pending']).optional(),
  flag: z.enum(['ONE_TIME', 'RECURRING', 'One-Time', 'Recurring']).optional()
});

export const updateExpenseSchema = createExpenseSchema.partial();
