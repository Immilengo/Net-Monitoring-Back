import { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { MonitoringLogService } from '../service/monitoring-log.service';

const service = new MonitoringLogService();

export class MonitoringLogController {
  async list(req: Request, res: Response) {
    const data = await service.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      size: req.query.size ? Number(req.query.size) : undefined,
      sortBy: req.query.sortBy as string | undefined,
      direction: req.query.direction as string | undefined,
      deviceId: req.query.deviceId as string | undefined,
      siteId: req.query.siteId as string | undefined,
      status: req.query.status as string | undefined,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
      search: req.query.search as string | undefined
    });
    res.json(successResponse('Monitoring logs retrieved successfully', data));
  }

  async getById(req: Request, res: Response) {
    const data = await service.getById(req.params.id);
    res.json(successResponse('Monitoring log retrieved successfully', data));
  }

  async getStatsByDevice(req: Request, res: Response) {
    const data = await service.getStatsByDevice(
      req.query.deviceId as string,
      req.query.from ? new Date(req.query.from as string) : undefined,
      req.query.to ? new Date(req.query.to as string) : undefined
    );
    res.json(successResponse('Device stats retrieved successfully', data));
  }

  async getLatestByDevice(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const data = await service.getLatestByDevice(req.params.deviceId, limit);
    res.json(successResponse('Latest logs retrieved successfully', data));
  }

  async purge(req: Request, res: Response) {
    const days = req.body.days ? Number(req.body.days) : 90;
    const data = await service.purgeOlderThan(days);
    res.json(successResponse(`Purged logs older than ${days} days`, data));
  }
}