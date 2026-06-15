import { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { AlertService } from '../service/alert.service';

const service = new AlertService();

export class AlertController {
  async list(req: Request, res: Response) {
    const data = await service.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      size: req.query.size ? Number(req.query.size) : undefined,
      sortBy: req.query.sortBy as string | undefined,
      direction: req.query.direction as string | undefined,
      deviceId: req.query.deviceId as string | undefined,
      level: req.query.level as string | undefined,
      acknowledged: req.query.acknowledged !== undefined
        ? req.query.acknowledged === 'true'
        : undefined,
      resolved: req.query.resolved !== undefined
        ? req.query.resolved === 'true'
        : undefined,
      search: req.query.search as string | undefined
    });
    res.json(successResponse('Alerts retrieved successfully', data));
  }

  async getById(req: Request, res: Response) {
    const data = await service.getById(req.params.id);
    res.json(successResponse('Alert retrieved successfully', data));
  }

  async acknowledge(req: Request, res: Response) {
    const data = await service.acknowledge(req.params.id, req.user?.sub);
    res.json(successResponse('Alert acknowledged successfully', data));
  }

  async resolve(req: Request, res: Response) {
    const data = await service.resolve(req.params.id, req.user?.sub);
    res.json(successResponse('Alert resolved successfully', data));
  }

  async resolveAllByDevice(req: Request, res: Response) {
    await service.resolveAllByDevice(req.params.deviceId, req.user?.sub);
    res.json(successResponse('All alerts for device resolved successfully'));
  }

  async getSummary(req: Request, res: Response) {
    const data = await service.getSummary();
    res.json(successResponse('Alert summary retrieved successfully', data));
  }
}