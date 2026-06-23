import { z } from 'zod';
import { DeviceType, MonitoringStatus, StatusSource } from '@prisma/client';

const deviceTypeValues = Object.values(DeviceType) as [string, ...string[]];
const monitoringStatusValues = Object.values(MonitoringStatus) as [string, ...string[]];
const statusSourceValues = Object.values(StatusSource) as [string, ...string[]];

// regex simples de IP v4
const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

export const createDeviceSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  hostname: z.string().optional(),
  ipAddress: z
    .string()
    .regex(ipv4Regex, 'Invalid IPv4 address'),
  macAddress: z.string().optional(),
  type: z.enum(deviceTypeValues as [string, ...string[]], {
    errorMap: () => ({ message: `Type must be one of: ${deviceTypeValues.join(', ')}` })
  }),
  description: z.string().optional(),
  siteId: z.string().uuid('Invalid site ID').optional()
});

export const updateDeviceSchema = z
  .object({
    name: z.string().min(2).optional(),
    hostname: z.string().optional(),
    ipAddress: z.string().regex(ipv4Regex, 'Invalid IPv4 address').optional(),
    macAddress: z.string().optional(),
    type: z.enum(deviceTypeValues as [string, ...string[]]).optional(),
    description: z.string().optional(),
    siteId: z.string().uuid().optional().nullable(),
    active: z.boolean().optional(),
    currentStatus: z.enum(monitoringStatusValues as [string, ...string[]]).optional(),
    statusSource: z.enum(statusSourceValues as [string, ...string[]]).optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be sent'
  });

export const listDeviceSchema = z.object({
  page: z.coerce.number().int().min(0).optional(),
  size: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['name', 'ipAddress', 'type', 'currentStatus', 'createdAt', 'updatedAt']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
  recordStatus: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).optional(),
  search: z.string().optional(),
  siteId: z.string().uuid().optional(),
  type: z.enum(deviceTypeValues as [string, ...string[]]).optional(),
  currentStatus: z.enum(monitoringStatusValues as [string, ...string[]]).optional(),
  active: z.coerce.boolean().optional()
});
