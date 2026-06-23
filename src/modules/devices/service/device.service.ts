import { DeviceType, MonitoringStatus, StatusSource } from '@prisma/client';
import { AppError } from '@errors/app-error';
import { AuditService } from '@modules/audit/service/audit.service';
import { toPageResponse, parsePageQuery } from '@modules/common/service/pagination.service';
import { prisma } from '@infra/database/prisma';
import { CreateDeviceDto, UpdateDeviceDto } from '../dto/device.dto';
import { toDeviceOutput } from '../mapper/device.mapper';
import { DeviceRepository } from '../repository/device.repository';

const VALID_SORT_FIELDS = ['name', 'ipAddress', 'type', 'currentStatus', 'createdAt', 'updatedAt'] as const;
type SortField = typeof VALID_SORT_FIELDS[number];

export class DeviceService {
  constructor(
    private readonly repository = new DeviceRepository(),
    private readonly audit = new AuditService()
  ) {}

  private async assertSiteExists(siteId: string) {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site || site.deleted) throw new AppError('Site not found', 404);
  }

  async create(input: CreateDeviceDto, actorId?: string) {
    const existing = await this.repository.findByIp(input.ipAddress);
    if (existing) throw new AppError('A device with this IP address already exists', 409);

    if (input.siteId) await this.assertSiteExists(input.siteId);

    const device = await this.repository.create({
      name: input.name.trim(),
      hostname: input.hostname ?? null,
      ipAddress: input.ipAddress.trim(),
      macAddress: input.macAddress ?? null,
      type: input.type as DeviceType,
      description: input.description ?? null,
      currentStatus: MonitoringStatus.OFFLINE,
      statusSource: StatusSource.AUTO,
      active: true,
      ...(input.siteId ? { site: { connect: { id: input.siteId } } } : {})
    });

    await this.audit.log({ userId: actorId, action: 'CREATE', resource: 'DEVICE', resourceId: device.id });
    return toDeviceOutput(device);
  }

  async getById(id: string) {
    const device = await this.repository.findById(id);
    if (!device || device.deleted) throw new AppError('Device not found', 404);
    return toDeviceOutput(device);
  }

  async list(query: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    search?: string;
    siteId?: string;
    type?: string;
    currentStatus?: string;
    active?: boolean;
  }) {
    const { page, size, skip, take } = parsePageQuery(query);

    const sortBy = (VALID_SORT_FIELDS.includes(query.sortBy as SortField) ? query.sortBy : 'createdAt') as SortField;
    const direction = (query.direction === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    const recordStatus = query.recordStatus ?? 'ACTIVE';

    const { items, total } = await this.repository.findMany({
      skip,
      take,
      sortBy,
      direction,
      recordStatus,
      search: query.search,
      siteId: query.siteId,
      type: query.type as DeviceType | undefined,
      currentStatus: query.currentStatus as MonitoringStatus | undefined,
      active: query.active
    });

    return toPageResponse(items.map(toDeviceOutput), total, page, size);
  }

  async update(id: string, input: UpdateDeviceDto, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.deleted) throw new AppError('Device not found', 404);

    if (input.ipAddress && input.ipAddress.trim() !== existing.ipAddress) {
      const conflict = await this.repository.findByIpExcluding(input.ipAddress.trim(), id);
      if (conflict) throw new AppError('A device with this IP address already exists', 409);
    }

    if (input.siteId) await this.assertSiteExists(input.siteId);

    const statusSource =
      input.statusSource ??
      (input.currentStatus !== undefined ? StatusSource.MANUAL : undefined);

    const device = await this.repository.update(id, {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.hostname !== undefined ? { hostname: input.hostname } : {}),
      ...(input.ipAddress ? { ipAddress: input.ipAddress.trim() } : {}),
      ...(input.macAddress !== undefined ? { macAddress: input.macAddress } : {}),
      ...(input.type ? { type: input.type as DeviceType } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.currentStatus !== undefined ? { currentStatus: input.currentStatus as MonitoringStatus } : {}),
      ...(statusSource ? { statusSource } : {}),
      ...(input.siteId !== undefined
        ? input.siteId === null
          ? { site: { disconnect: true } }
          : { site: { connect: { id: input.siteId } } }
        : {})
    });

    await this.audit.log({ userId: actorId, action: 'UPDATE', resource: 'DEVICE', resourceId: id });
    return toDeviceOutput(device);
  }

  async softDelete(id: string, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.deleted) throw new AppError('Device not found', 404);

    await this.repository.update(id, { deleted: true, active: false });

    await this.audit.log({ userId: actorId, action: 'SOFT_DELETE', resource: 'DEVICE', resourceId: id });
  }

  async restore(id: string, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('Device not found', 404);
    if (!existing.deleted) throw new AppError('Device is already active', 400);

    const device = await this.repository.update(id, { deleted: false, active: true });

    await this.audit.log({ userId: actorId, action: 'RESTORE', resource: 'DEVICE', resourceId: id });
    return toDeviceOutput(device);
  }

  // usado internamente pelo scheduler — não exposto via API directamente
  async updateStatus(id: string, status: MonitoringStatus) {
    return this.repository.update(id, { currentStatus: status });
  }
}
