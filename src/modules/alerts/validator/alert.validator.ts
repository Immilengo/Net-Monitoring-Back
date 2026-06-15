import { z } from 'zod';
import { AlertLevel } from '@prisma/client';

const alertLevelValues = Object.values(AlertLevel) as [string, ...string[]];

export const listAlertSchema = z.object({
  page: z.coerce.number().int().min(0).optional(),
  size: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['level', 'createdAt', 'updatedAt']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
  deviceId: z.string().uuid().optional(),
  level: z.enum(alertLevelValues as [string, ...string[]]).optional(),
  acknowledged: z.coerce.boolean().optional(),
  resolved: z.coerce.boolean().optional(),
  search: z.string().optional()
});

export const acknowledgeAlertSchema = z.object({
  note: z.string().max(500).optional()
});