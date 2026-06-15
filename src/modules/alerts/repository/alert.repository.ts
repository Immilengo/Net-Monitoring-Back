import { AlertLevel, Prisma } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

const deviceSelect = {
  id: true,
  name: true,
  ipAddress: true
} as const;

export class AlertRepository {
  private readonly include = { device: { select: deviceSelect } } as const;

  async findById(id: string) {
    return prisma.alert.findUnique({ where: { id }, include: this.include });
  }

  async findMany(params: {
    skip: number;
    take: number;
    sortBy: 'level' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
    deviceId?: string;
    level?: AlertLevel;
    acknowledged?: boolean;
    resolved?: boolean;
    search?: string;
  }) {
    const where: Prisma.AlertWhereInput = {
      ...(params.deviceId ? { deviceId: params.deviceId } : {}),
      ...(params.level ? { level: params.level } : {}),
      ...(params.acknowledged !== undefined ? { acknowledged: params.acknowledged } : {}),
      ...(params.resolved !== undefined ? { resolved: params.resolved } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: 'insensitive' } },
              { message: { contains: params.search, mode: 'insensitive' } },
              { device: { name: { contains: params.search, mode: 'insensitive' } } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.alert.count({ where })
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.AlertUpdateInput) {
    return prisma.alert.update({ where: { id }, data, include: this.include });
  }

  async countUnresolved() {
    return prisma.alert.count({ where: { resolved: false } });
  }

  async countByLevel(level: AlertLevel) {
    return prisma.alert.count({ where: { level, resolved: false } });
  }
}