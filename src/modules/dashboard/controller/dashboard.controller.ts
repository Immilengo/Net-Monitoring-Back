import { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { DashboardService } from '../service/dashboard.service';

const service = new DashboardService();

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    const data = await service.getSummary();
    res.json(successResponse('Dashboard summary retrieved successfully', data));
  }

  async getCounters(req: Request, res: Response) {
    const data = await service.getCounters();
    res.json(successResponse('Dashboard counters retrieved successfully', data));
  }
}