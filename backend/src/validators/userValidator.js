import { z } from 'zod';

const indianPhone = z.preprocess(
  value => typeof value === 'string' ? value.replace(/\D/g, '') : value,
  z.string().regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian mobile number')
);

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email address format'),
  phone: indianPhone
});