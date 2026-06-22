import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { DeviceController } from '../controller/device.controller';
import { createDeviceSchema, updateDeviceSchema, listDeviceSchema } from '../validator/device.validator';

const controller = new DeviceController();
export const deviceRoutes = Router();

deviceRoutes.use(authMiddleware);

deviceRoutes.post(
  '/',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(createDeviceSchema),
  asyncHandler(controller.create.bind(controller))
);

deviceRoutes.get(
  '/',
  rolesMiddleware(['ADMIN', 'MANAGER', 'VIEWER']),
  validationMiddleware(listDeviceSchema, 'query'),
  asyncHandler(controller.list.bind(controller))
);

deviceRoutes.get(
  '/:id',
  rolesMiddleware(['ADMIN', 'MANAGER', 'VIEWER']),
  asyncHandler(controller.getById.bind(controller))
);

deviceRoutes.patch(
  '/:id',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(updateDeviceSchema),
  asyncHandler(controller.update.bind(controller))
);

deviceRoutes.delete(
  '/:id',
  rolesMiddleware(['ADMIN']),
  asyncHandler(controller.remove.bind(controller))
);

deviceRoutes.patch(
  '/:id/restore',
  rolesMiddleware(['ADMIN']),
  asyncHandler(controller.restore.bind(controller))
);
