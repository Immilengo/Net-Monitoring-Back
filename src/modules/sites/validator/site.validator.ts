import { z } from 'zod';

export const createSiteSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional()
});

export const updateSiteSchema = z
  .object({
    name: z.string().min(2).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    description: z.string().optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be sent'
  });