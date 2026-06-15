import { z } from 'zod';
import { ServiceType } from '@prisma/client';

const serviceTypeValues = Object.values(ServiceType) as [string, ...string[]];

// portas padrão por tipo de serviço — usadas como sugestão na validação
const DEFAULT_PORTS: Record<string, number> = {
  HTTP: 80,
  HTTPS: 443,
  SSH: 22,
  DNS: 53,
  MYSQL: 3306,
  POSTGRESQL: 5432,
  SMTP: 25,
  SMIME: 465,
  FTP: 21,
  TCP: 0
};

export const createServiceMonitorSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
  name: z.string().min(2, 'Name must have at least 2 characters'),
  type: z.enum(serviceTypeValues as [string, ...string[]], {
    errorMap: () => ({ message: `Type must be one of: ${serviceTypeValues.join(', ')}` })
  }),
  port: z
    .number({ invalid_type_error: 'Port must be a number' })
    .int('Port must be an integer')
    .min(1, 'Port must be between 1 and 65535')
    .max(65535, 'Port must be between 1 and 65535'),
  enabled: z.boolean().optional().default(true),
  timeoutSeconds: z
    .number()
    .int()
    .min(1, 'Timeout must be at least 1 second')
    .max(60, 'Timeout cannot exceed 60 seconds')
    .optional()
    .default(5)
});

export const updateServiceMonitorSchema = z
  .object({
    name: z.string().min(2).optional(),
    type: z.enum(serviceTypeValues as [string, ...string[]]).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    enabled: z.boolean().optional(),
    timeoutSeconds: z.number().int().min(1).max(60).optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be sent'
  });

export const listServiceMonitorSchema = z.object({
  page: z.coerce.number().int().min(0).optional(),
  size: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['name', 'type', 'port', 'createdAt', 'updatedAt']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
  deviceId: z.string().uuid().optional(),
  type: z.enum(serviceTypeValues as [string, ...string[]]).optional(),
  enabled: z.coerce.boolean().optional(),
  search: z.string().optional()
});

export { DEFAULT_PORTS };