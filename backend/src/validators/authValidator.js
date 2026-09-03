import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.preprocess(
    value => typeof value === 'string' ? value.replace(/\D/g, '') : value,
    z.string().regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian mobile number')
  ),
  timezone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});
