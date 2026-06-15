import { Prisma, ServiceType } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

const deviceSelect = {
  id: true,
  name: true,
  ipAddress: true
} as const;

export class ServiceMonitorRepository {
  private readonly include = { device: { select: deviceSelect } } as const;

  async create(data: Prisma.ServiceMonitorCreateInput) {
    return prisma.serviceMonitor.create({ data, include: this.include });
  }

  async findById(id: string) {
    return prisma.serviceMonitor.findUnique({ where: { id }, include: this.include });
  }

  async findByDeviceAndTypeAndPort(deviceId: string, type: ServiceType, port: number) {
    return prisma.serviceMonitor.findFirst({
      where: { deviceId, type, port }
    });
  }

  async findByDeviceAndTypeAndPortExcluding(
    deviceId: string,
    type: ServiceType,
    port: number,
    excludeId: string
  ) {
    return prisma.serviceMonitor.findFirst({
      where: { deviceId, type, port, id: { not: excludeId } }
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    sortBy: 'name' | 'type' | 'port' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
    deviceId?: string;
    type?: ServiceType;
    enabled?: boolean;
    search?: string;
  }) {
    const where: Prisma.ServiceMonitorWhereInput = {
      ...(params.deviceId ? { deviceId: params.deviceId } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.enabled !== undefined ? { enabled: params.enabled } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { device: { name: { contains: params.search, mode: 'insensitive' } } },
              { device: { ipAddress: { contains: params.search, mode: 'insensitive' } } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.serviceMonitor.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.serviceMonitor.count({ where })
    ]);

    return { items, total };
  }

  async findAllEnabledByDevice(deviceId: string) {
    return prisma.serviceMonitor.findMany({
      where: { deviceId, enabled: true },
      include: this.include
    });
  }

  async findAllEnabled() {
    return prisma.serviceMonitor.findMany({
      where: { enabled: true },
      include: this.include
    });
  }

  async update(id: string, data: Prisma.ServiceMonitorUpdateInput) {
    return prisma.serviceMonitor.update({ where: { id }, data, include: this.include });
  }

  async delete(id: string) {
    return prisma.serviceMonitor.delete({ where: { id } });
  }
}