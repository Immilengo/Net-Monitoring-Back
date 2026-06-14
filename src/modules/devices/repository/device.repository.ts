import { DeviceType, MonitoringStatus, Prisma } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

const siteSelect = {
  id: true,
  name: true,
  city: true,
  country: true
} as const;

export class DeviceRepository {
  private readonly include = { site: { select: siteSelect } } as const;

  async create(data: Prisma.DeviceCreateInput) {
    return prisma.device.create({ data, include: this.include });
  }

  async findById(id: string) {
    return prisma.device.findUnique({ where: { id }, include: this.include });
  }

  async findByIp(ipAddress: string) {
    return prisma.device.findFirst({ where: { ipAddress, deleted: false } });
  }

  async findByIpExcluding(ipAddress: string, excludeId: string) {
    return prisma.device.findFirst({
      where: { ipAddress, deleted: false, id: { not: excludeId } }
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    recordStatus: 'ACTIVE' | 'INACTIVE' | 'ALL';
    sortBy: 'name' | 'ipAddress' | 'type' | 'currentStatus' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
    search?: string;
    siteId?: string;
    type?: DeviceType;
    currentStatus?: MonitoringStatus;
    active?: boolean;
  }) {
    const where: Prisma.DeviceWhereInput = {
      ...(params.recordStatus === 'ALL' ? {} : { deleted: params.recordStatus === 'INACTIVE' }),
      ...(params.siteId ? { siteId: params.siteId } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.currentStatus ? { currentStatus: params.currentStatus } : {}),
      ...(params.active !== undefined ? { active: params.active } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { hostname: { contains: params.search, mode: 'insensitive' } },
              { ipAddress: { contains: params.search, mode: 'insensitive' } },
              { description: { contains: params.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.device.count({ where })
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.DeviceUpdateInput) {
    return prisma.device.update({ where: { id }, data, include: this.include });
  }

  async countBySite(siteId: string) {
    return prisma.device.count({ where: { siteId, deleted: false } });
  }
}