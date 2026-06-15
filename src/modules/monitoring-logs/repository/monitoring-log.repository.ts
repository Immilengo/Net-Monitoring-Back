import { MonitoringStatus, Prisma } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

const deviceSelect = {
  id: true,
  name: true,
  ipAddress: true,
  siteId: true,
  site: { select: { name: true } }
} as const;

export class MonitoringLogRepository {
  private readonly include = { device: { select: deviceSelect } } as const;

  async findMany(params: {
    skip: number;
    take: number;
    sortBy: 'checkedAt' | 'status' | 'responseTime';
    direction: 'asc' | 'desc';
    deviceId?: string;
    siteId?: string;
    status?: MonitoringStatus;
    from?: Date;
    to?: Date;
    search?: string;
  }) {
    const where: Prisma.MonitoringLogWhereInput = {
      ...(params.deviceId ? { deviceId: params.deviceId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.siteId ? { device: { siteId: params.siteId } } : {}),
      ...(params.from || params.to
        ? {
            checkedAt: {
              ...(params.from ? { gte: params.from } : {}),
              ...(params.to ? { lte: params.to } : {})
            }
          }
        : {}),
      ...(params.search
        ? {
            OR: [
              { device: { name: { contains: params.search, mode: 'insensitive' } } },
              { device: { ipAddress: { contains: params.search, mode: 'insensitive' } } },
              { message: { contains: params.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.monitoringLog.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.monitoringLog.count({ where })
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.monitoringLog.findUnique({
      where: { id },
      include: this.include
    });
  }

  // -------------------------------------------------------------------------
  // Estatísticas agregadas por device num período
  // -------------------------------------------------------------------------
  async getStatsByDevice(deviceId: string, from: Date, to: Date) {
    const [counts, aggregates] = await Promise.all([
      prisma.monitoringLog.groupBy({
        by: ['status'],
        where: {
          deviceId,
          checkedAt: { gte: from, lte: to }
        },
        _count: { id: true }
      }),
      prisma.monitoringLog.aggregate({
        where: {
          deviceId,
          checkedAt: { gte: from, lte: to },
          responseTime: { not: null }
        },
        _avg: {
          responseTime: true,
          packetLoss: true
        }
      })
    ]);

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: { name: true, ipAddress: true }
    });

    let onlineCount = 0;
    let offlineCount = 0;
    let warningCount = 0;

    for (const row of counts) {
      if (row.status === 'ONLINE') onlineCount = row._count.id;
      if (row.status === 'OFFLINE') offlineCount = row._count.id;
      if (row.status === 'WARNING') warningCount = row._count.id;
    }

    const totalChecks = onlineCount + offlineCount + warningCount;
    const uptimePercent =
      totalChecks > 0
        ? Math.round((onlineCount / totalChecks) * 10000) / 100
        : 0;

    return {
      deviceId,
      deviceName: device?.name ?? 'Unknown',
      deviceIp: device?.ipAddress ?? '',
      totalChecks,
      onlineCount,
      offlineCount,
      warningCount,
      uptimePercent,
      avgResponseTime: aggregates._avg.responseTime
        ? Math.round(aggregates._avg.responseTime)
        : null,
      avgPacketLoss: aggregates._avg.packetLoss
        ? Math.round(aggregates._avg.packetLoss * 100) / 100
        : null,
      period: { from, to }
    };
  }

  // -------------------------------------------------------------------------
  // Últimas N verificações de um device específico — para mini-histórico
  // -------------------------------------------------------------------------
  async findLatestByDevice(deviceId: string, limit: number = 50) {
    return prisma.monitoringLog.findMany({
      where: { deviceId },
      orderBy: { checkedAt: 'desc' },
      take: limit,
      include: this.include
    });
  }

  // -------------------------------------------------------------------------
  // Purge de logs antigos — útil para manutenção (chamado manualmente ou via cron)
  // -------------------------------------------------------------------------
  async deleteOlderThan(date: Date) {
    return prisma.monitoringLog.deleteMany({
      where: { checkedAt: { lt: date } }
    });
  }
}