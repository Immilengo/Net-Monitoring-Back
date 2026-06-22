import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { AlertController } from '../controller/alert.controller';
import { listAlertSchema } from '../validator/alert.validator';

const controller = new AlertController();
export const alertRoutes = Router();

alertRoutes.use(authMiddleware);

// Sumário para o dashboard — sem paginação
alertRoutes.get(
  '/summary',
  rolesMiddleware(['ADMIN', 'MANAGER', 'VIEWER']),
  asyncHandler(controller.getSummary.bind(controller))
);

alertRoutes.get(
  '/',
  rolesMiddleware(['ADMIN', 'MANAGER', 'VIEWER']),
  validationMiddleware(listAlertSchema, 'query'),
  asyncHandler(controller.list.bind(controller))
);

alertRoutes.get(
  '/:id',
  rolesMiddleware(['ADMIN', 'MANAGER', 'VIEWER']),
  asyncHandler(controller.getById.bind(controller))
);

// Acknowledge — qualquer manager pode reconhecer
alertRoutes.patch(
  '/:id/acknowledge',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  asyncHandler(controller.acknowledge.bind(controller))
);

// Resolve — apenas ADMIN resolve manualmente
alertRoutes.patch(
  '/:id/resolve',
  rolesMiddleware(['ADMIN']),
  asyncHandler(controller.resolve.bind(controller))
);

// Resolve todos os alertas abertos de um device
alertRoutes.patch(
  '/device/:deviceId/resolve-all',
  rolesMiddleware(['ADMIN']),
  asyncHandler(controller.resolveAllByDevice.bind(controller))
);
