import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { DashboardController } from '../controller/dashboard.controller';

const controller = new DashboardController();
export const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);

// Sumário completo — carregado uma vez ao abrir o dashboard
dashboardRoutes.get(
  '/summary',
  rolesMiddleware(['ADMIN', 'MANAGER', 'VIEWER']),
  asyncHandler(controller.getSummary.bind(controller))
);

// Contadores leves — para polling periódico do frontend (ex: a cada 30s)
dashboardRoutes.get(
  '/counters',
  rolesMiddleware(['ADMIN', 'MANAGER', 'VIEWER']),
  asyncHandler(controller.getCounters.bind(controller))
);
