import { ServiceType } from '@prisma/client';
import { AppError } from '@errors/app-error';
import { AuditService } from '@modules/audit/service/audit.service';
import { toPageResponse, parsePageQuery } from '@modules/common/service/pagination.service';
import { prisma } from '@infra/database/prisma';
import { CreateServiceMonitorDto, UpdateServiceMonitorDto } from '../dto/service-monitor.dto';
import { toServiceMonitorOutput } from '../mapper/service-monitor.mapper';
import { ServiceMonitorRepository } from '../repository/service-monitor.repository';

const VALID_SORT_FIELDS = ['name', 'type', 'port', 'createdAt', 'updatedAt'] as const;
type SortField = typeof VALID_SORT_FIELDS[number];

export class ServiceMonitorService {
  constructor(
    private readonly repository = new ServiceMonitorRepository(),
    private readonly audit = new AuditService()
  ) {}

  private async assertDeviceExists(deviceId: string) {
    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device || device.deleted) throw new AppError('Device not found', 404);
    return device;
  }

  async create(input: CreateServiceMonitorDto, actorId?: string) {
    await this.assertDeviceExists(input.deviceId);

    // impede duplicado: mesmo device + mesmo tipo + mesma porta
    const conflict = await this.repository.findByDeviceAndTypeAndPort(
      input.deviceId,
      input.type as ServiceType,
      input.port
    );
    if (conflict) {
      throw new AppError(
        `This device already has a ${input.type} service monitor on port ${input.port}`,
        409
      );
    }

    const sm = await this.repository.create({
      name: input.name.trim(),
      type: input.type as ServiceType,
      port: input.port,
      enabled: input.enabled ?? true,
      timeoutSeconds: input.timeoutSeconds ?? 5,
      device: { connect: { id: input.deviceId } }
    });

    await this.audit.log({
      userId: actorId,
      action: 'CREATE',
      resource: 'SERVICE_MONITOR',
      resourceId: sm.id
    });

    return toServiceMonitorOutput(sm);
  }

  async getById(id: string) {
    const sm = await this.repository.findById(id);
    if (!sm) throw new AppError('Service monitor not found', 404);
    return toServiceMonitorOutput(sm);
  }

  async list(query: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    deviceId?: string;
    type?: string;
    enabled?: boolean;
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
      type: query.type as ServiceType | undefined,
      enabled: query.enabled,
      search: query.search
    });

    return toPageResponse(items.map(toServiceMonitorOutput), total, page, size);
  }

  async listByDevice(deviceId: string) {
    await this.assertDeviceExists(deviceId);
    const items = await this.repository.findAllEnabledByDevice(deviceId);
    return items.map(toServiceMonitorOutput);
  }

  async update(id: string, input: UpdateServiceMonitorDto, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('Service monitor not found', 404);

    const newType = (input.type as ServiceType | undefined) ?? existing.type;
    const newPort = input.port ?? existing.port;

    // verifica conflito só se tipo ou porta mudaram
    if (input.type || input.port) {
      const conflict = await this.repository.findByDeviceAndTypeAndPortExcluding(
        existing.deviceId,
        newType,
        newPort,
        id
      );
      if (conflict) {
        throw new AppError(
          `This device already has a ${newType} service monitor on port ${newPort}`,
          409
        );
      }
    }

    const sm = await this.repository.update(id, {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.type ? { type: input.type as ServiceType } : {}),
      ...(input.port !== undefined ? { port: input.port } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.timeoutSeconds !== undefined ? { timeoutSeconds: input.timeoutSeconds } : {})
    });

    await this.audit.log({
      userId: actorId,
      action: 'UPDATE',
      resource: 'SERVICE_MONITOR',
      resourceId: id
    });

    return toServiceMonitorOutput(sm);
  }

  async remove(id: string, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('Service monitor not found', 404);

    await this.repository.delete(id);

    await this.audit.log({
      userId: actorId,
      action: 'DELETE',
      resource: 'SERVICE_MONITOR',
      resourceId: id
    });
  }

  async toggleEnabled(id: string, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('Service monitor not found', 404);

    const sm = await this.repository.update(id, { enabled: !existing.enabled });

    await this.audit.log({
      userId: actorId,
      action: existing.enabled ? 'DISABLE' : 'ENABLE',
      resource: 'SERVICE_MONITOR',
      resourceId: id
    });

    return toServiceMonitorOutput(sm);
  }
}