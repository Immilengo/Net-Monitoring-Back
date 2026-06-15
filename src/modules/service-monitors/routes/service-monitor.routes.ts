import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { ServiceMonitorController } from '../controller/service-monitor.controller';
import {
  createServiceMonitorSchema,
  updateServiceMonitorSchema,
  listServiceMonitorSchema
} from '../validator/service-monitor.validator';

const controller = new ServiceMonitorController();
export const serviceMonitorRoutes = Router();

serviceMonitorRoutes.use(authMiddleware);

serviceMonitorRoutes.post(
  '/',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(createServiceMonitorSchema),
  asyncHandler(controller.create.bind(controller))
);

serviceMonitorRoutes.get(
  '/',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(listServiceMonitorSchema, 'query'),
  asyncHandler(controller.list.bind(controller))
);

serviceMonitorRoutes.get(
  '/device/:deviceId',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  asyncHandler(controller.listByDevice.bind(controller))
);

serviceMonitorRoutes.get(
  '/:id',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  asyncHandler(controller.getById.bind(controller))
);

serviceMonitorRoutes.patch(
  '/:id',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(updateServiceMonitorSchema),
  asyncHandler(controller.update.bind(controller))
);

serviceMonitorRoutes.patch(
  '/:id/toggle',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  asyncHandler(controller.toggleEnabled.bind(controller))
);

serviceMonitorRoutes.delete(
  '/:id',
  rolesMiddleware(['ADMIN']),
  asyncHandler(controller.remove.bind(controller))
);