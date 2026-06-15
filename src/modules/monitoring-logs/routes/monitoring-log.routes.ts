import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { MonitoringLogController } from '../controller/monitoring-log.controller';
import {
  listMonitoringLogSchema,
  statsQuerySchema,
  latestByDeviceSchema
} from '../validator/monitoring-log.validator';

const controller = new MonitoringLogController();
export const monitoringLogRoutes = Router();

monitoringLogRoutes.use(authMiddleware);

monitoringLogRoutes.get(
  '/',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(listMonitoringLogSchema, 'query'),
  asyncHandler(controller.list.bind(controller))
);

monitoringLogRoutes.get(
  '/stats',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(statsQuerySchema, 'query'),
  asyncHandler(controller.getStatsByDevice.bind(controller))
);

monitoringLogRoutes.get(
  '/device/:deviceId/latest',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(latestByDeviceSchema, 'query'),
  asyncHandler(controller.getLatestByDevice.bind(controller))
);

monitoringLogRoutes.get(
  '/:id',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  asyncHandler(controller.getById.bind(controller))
);

// Purge — apenas ADMIN, operação destrutiva
monitoringLogRoutes.delete(
  '/purge',
  rolesMiddleware(['ADMIN']),
  asyncHandler(controller.purge.bind(controller))
);