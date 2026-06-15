import { AlertLevel } from '@prisma/client';
import { AppError } from '@errors/app-error';
import { AuditService } from '@modules/audit/service/audit.service';
import { toPageResponse, parsePageQuery } from '@modules/common/service/pagination.service';
import { toAlertOutput } from '../mapper/alert.mapper';
import { AlertRepository } from '../repository/alert.repository';

const VALID_SORT_FIELDS = ['level', 'createdAt', 'updatedAt'] as const;
type SortField = typeof VALID_SORT_FIELDS[number];

export class AlertService {
  constructor(
    private readonly repository = new AlertRepository(),
    private readonly audit = new AuditService()
  ) {}

  async getById(id: string) {
    const alert = await this.repository.findById(id);
    if (!alert) throw new AppError('Alert not found', 404);
    return toAlertOutput(alert);
  }

  async list(query: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    deviceId?: string;
    level?: string;
    acknowledged?: boolean;
    resolved?: boolean;
    search?: string;
  }) {
    const { page, size, skip, take } = parsePageQuery(query);

    const sortBy = (VALID_SORT_FIELDS.includes(query.sortBy as SortField)
      ? query.sortBy
      : 'createdAt') as SortField;
    const direction = (query.direction === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

    const { items, total } = await this.repository.findMany({
      skip,
      take,
      sortBy,
      direction,
      deviceId: query.deviceId,
      level: query.level as AlertLevel | undefined,
      acknowledged: query.acknowledged,
      resolved: query.resolved,
      search: query.search
    });

    return toPageResponse(items.map(toAlertOutput), total, page, size);
  }

  async acknowledge(id: string, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('Alert not found', 404);
    if (existing.acknowledged) throw new AppError('Alert is already acknowledged', 400);

    const alert = await this.repository.update(id, {
      acknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy: actorId ?? null
    });

    await this.audit.log({
      userId: actorId,
      action: 'ACKNOWLEDGE',
      resource: 'ALERT',
      resourceId: id
    });

    return toAlertOutput(alert);
  }

  async resolve(id: string, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('Alert not found', 404);
    if (existing.resolved) throw new AppError('Alert is already resolved', 400);

    const alert = await this.repository.update(id, {
      resolved: true,
      resolvedAt: new Date(),
      // se ainda não foi acknowledged, acknowledger automaticamente ao resolver
      ...(existing.acknowledged
        ? {}
        : { acknowledged: true, acknowledgedAt: new Date(), acknowledgedBy: actorId ?? null })
    });

    await this.audit.log({
      userId: actorId,
      action: 'RESOLVE',
      resource: 'ALERT',
      resourceId: id
    });

    return toAlertOutput(alert);
  }

    async resolveAllByDevice(deviceId: string, actorId?: string) {
    const { prisma } = await import('@infra/database/prisma');

    await prisma.alert.updateMany({
        where: { deviceId, resolved: false },
        data: {
        resolved: true,
        resolvedAt: new Date()
        }
    });

  await this.audit.log({
    userId: actorId,
    action: 'RESOLVE_ALL',
    resource: 'ALERT',
    resourceId: deviceId
  });
}

  // Sumário para o dashboard
  async getSummary() {
    const [total, critical, warning, info] = await Promise.all([
      this.repository.countUnresolved(),
      this.repository.countByLevel(AlertLevel.CRITICAL),
      this.repository.countByLevel(AlertLevel.WARNING),
      this.repository.countByLevel(AlertLevel.INFO)
    ]);

    return { total, critical, warning, info };
  }
}