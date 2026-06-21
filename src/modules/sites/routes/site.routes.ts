import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { asyncHandler } from '@utils/async-handler';
import { SiteService } from '../controller/site.controller';
import { createSiteSchema, updateSiteSchema } from '../validator/site.validator';

const service = new SiteService();
export const siteRoutes = Router();

siteRoutes.use(authMiddleware);

siteRoutes.post(
  '/',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(createSiteSchema),
  asyncHandler(async (req, res) => {
    const site = await service.create(req.body, req.user?.id);
    res.status(201).json({ success: true, message: 'Site created successfully', data: site });
  })
);

siteRoutes.get(
  '/',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  asyncHandler(async (req, res) => {
    const page = await service.list(req.query);
    res.status(200).json({ success: true, message: 'Sites fetched successfully', data: page });
  })
);

siteRoutes.get(
  '/:id',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  asyncHandler(async (req, res) => {
    const site = await service.getById(req.params.id);
    res.status(200).json({ success: true, message: 'Site fetched successfully', data: site });
  })
);

siteRoutes.patch(
  '/:id',
  rolesMiddleware(['ADMIN', 'MANAGER']),
  validationMiddleware(updateSiteSchema),
  asyncHandler(async (req, res) => {
    const site = await service.update(req.params.id, req.body, req.user?.id);
    res.status(200).json({ success: true, message: 'Site updated successfully', data: site });
  })
);

siteRoutes.delete(
  '/:id',
  rolesMiddleware(['ADMIN']),
  asyncHandler(async (req, res) => {
    await service.softDelete(req.params.id, req.user?.id);
    res.status(200).json({ success: true, message: 'Site deleted successfully', data: null });
  })
);

siteRoutes.patch(
  '/:id/restore',
  rolesMiddleware(['ADMIN']),
  asyncHandler(async (req, res) => {
    const site = await service.restore(req.params.id, req.user?.id);
    res.status(200).json({ success: true, message: 'Site restored successfully', data: site });
  })
);
