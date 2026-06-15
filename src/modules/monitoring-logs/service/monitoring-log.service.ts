import { MonitoringStatus } from '@prisma/client';
import { AppError } from '@errors/app-error';
import { toPageResponse, parsePageQuery } from '@modules/common/service/pagination.service';
import { toMonitoringLogOutput } from '../mapper/monitoring-log.mapper';
import { MonitoringLogRepository } from '../repository/monitoring-log.repository';

const VALID_SORT_FIELDS = ['checkedAt', 'status', 'responseTime'] as const;
type SortField = typeof VALID_SORT_FIELDS[number];

// Período padrão: últimas 24h
const defaultFrom = () => new Date(Date.now() - 24 * 60 * 60 * 1000);
const defaultTo = () => new Date();

export class MonitoringLogService {
  constructor(private readonly repository = new MonitoringLogRepository()) {}

  async list(query: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    deviceId?: string;
    siteId?: string;
    status?: string;
    from?: Date;
    to?: Date;
    search?: string;
  }) {
    const { page, size, skip, take } = parsePageQuery(query);

    const sortBy = (VALID_SORT_FIELDS.includes(query.sortBy as SortField)
      ? query.sortBy
      : 'checkedAt') as SortField;
    const direction = (query.direction === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

    if (query.from && query.to && query.from > query.to) {
      throw new AppError('"from" must be earlier than "to"', 400);
    }

    const { items, total } = await this.repository.findMany({
      skip,
      take,
      sortBy,
      direction,
      deviceId: query.deviceId,
      siteId: query.siteId,
      status: query.status as MonitoringStatus | undefined,
      from: query.from,
      to: query.to,
      search: query.search
    });

    return toPageResponse(items.map(toMonitoringLogOutput), total, page, size);
  }

  async getById(id: string) {
    const log = await this.repository.findById(id);
    if (!log) throw new AppError('Monitoring log not found', 404);
    return toMonitoringLogOutput(log);
  }

  async getStatsByDevice(deviceId: string, from?: Date, to?: Date) {
    const resolvedFrom = from ?? defaultFrom();
    const resolvedTo = to ?? defaultTo();

    if (resolvedFrom > resolvedTo) {
      throw new AppError('"from" must be earlier than "to"', 400);
    }

    return this.repository.getStatsByDevice(deviceId, resolvedFrom, resolvedTo);
  }

  async getLatestByDevice(deviceId: string, limit: number = 50) {
    const items = await this.repository.findLatestByDevice(deviceId, limit);
    return items.map(toMonitoringLogOutput);
  }

  // -------------------------------------------------------------------------
  // Purge manual — apenas ADMIN, máximo 90 dias de retenção por defeito
  // -------------------------------------------------------------------------
  async purgeOlderThan(days: number) {
    if (days < 1 || days > 365) {
      throw new AppError('Days must be between 1 and 365', 400);
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.repository.deleteOlderThan(cutoff);

    return { deleted: result.count, cutoffDate: cutoff };
  }
}