import { z } from 'zod';
import { MonitoringStatus } from '@prisma/client';

const monitoringStatusValues = Object.values(MonitoringStatus) as [string, ...string[]];

export const listMonitoringLogSchema = z.object({
  page: z.coerce.number().int().min(0).optional(),
  size: z.coerce.number().int().min(1).max(200).optional(),
  sortBy: z.enum(['checkedAt', 'status', 'responseTime']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
  deviceId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  status: z.enum(monitoringStatusValues as [string, ...string[]]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().optional()
});

export const statsQuerySchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});

export const latestByDeviceSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional()
});