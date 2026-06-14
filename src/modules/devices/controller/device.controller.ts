import { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { DeviceService } from '../service/device.service';

const service = new DeviceService();

export class DeviceController {
  async create(req: Request, res: Response) {
    const data = await service.create(req.body, req.user?.sub);
    res.status(201).json(successResponse('Device created successfully', data));
  }

  async list(req: Request, res: Response) {
    const data = await service.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      size: req.query.size ? Number(req.query.size) : undefined,
      sortBy: req.query.sortBy as string | undefined,
      direction: req.query.direction as string | undefined,
      recordStatus: req.query.recordStatus as 'ACTIVE' | 'INACTIVE' | 'ALL' | undefined,
      search: req.query.search as string | undefined,
      siteId: req.query.siteId as string | undefined,
      type: req.query.type as string | undefined,
      currentStatus: req.query.currentStatus as string | undefined,
      active: req.query.active !== undefined ? req.query.active === 'true' : undefined
    });
    res.json(successResponse('Devices retrieved successfully', data));
  }

  async getById(req: Request, res: Response) {
    const data = await service.getById(req.params.id);
    res.json(successResponse('Device retrieved successfully', data));
  }

  async update(req: Request, res: Response) {
    const data = await service.update(req.params.id, req.body, req.user?.sub);
    res.json(successResponse('Device updated successfully', data));
  }

  async remove(req: Request, res: Response) {
    await service.softDelete(req.params.id, req.user?.sub);
    res.json(successResponse('Device deleted successfully'));
  }

  async restore(req: Request, res: Response) {
    const data = await service.restore(req.params.id, req.user?.sub);
    res.json(successResponse('Device restored successfully', data));
  }
}