import { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { ServiceMonitorService } from '../service/service-monitor.service';

const service = new ServiceMonitorService();

export class ServiceMonitorController {
  async create(req: Request, res: Response) {
    const data = await service.create(req.body, req.user?.sub);
    res.status(201).json(successResponse('Service monitor created successfully', data));
  }

  async list(req: Request, res: Response) {
    const data = await service.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      size: req.query.size ? Number(req.query.size) : undefined,
      sortBy: req.query.sortBy as string | undefined,
      direction: req.query.direction as string | undefined,
      deviceId: req.query.deviceId as string | undefined,
      type: req.query.type as string | undefined,
      enabled: req.query.enabled !== undefined ? req.query.enabled === 'true' : undefined,
      search: req.query.search as string | undefined
    });
    res.json(successResponse('Service monitors retrieved successfully', data));
  }

  async getById(req: Request, res: Response) {
    const data = await service.getById(req.params.id);
    res.json(successResponse('Service monitor retrieved successfully', data));
  }

  async listByDevice(req: Request, res: Response) {
    const data = await service.listByDevice(req.params.deviceId);
    res.json(successResponse('Device service monitors retrieved successfully', data));
  }

  async update(req: Request, res: Response) {
    const data = await service.update(req.params.id, req.body, req.user?.sub);
    res.json(successResponse('Service monitor updated successfully', data));
  }

  async remove(req: Request, res: Response) {
    await service.remove(req.params.id, req.user?.sub);
    res.json(successResponse('Service monitor deleted successfully'));
  }

  async toggleEnabled(req: Request, res: Response) {
    const data = await service.toggleEnabled(req.params.id, req.user?.sub);
    res.json(successResponse('Service monitor toggled successfully', data));
  }
}