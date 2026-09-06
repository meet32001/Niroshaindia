import { z } from 'zod';

export const addressSchema = z.object({
  id: z.string().optional(),
  recipient_name: z.string().min(2, 'Recipient name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'),
  address_line1: z.string().min(3, 'Address line 1 is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit PIN code'),
  country: z.string().default('India'),
  is_default: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
