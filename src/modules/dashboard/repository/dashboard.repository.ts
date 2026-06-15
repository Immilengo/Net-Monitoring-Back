import { MonitoringStatus } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

export class DashboardRepository {
  // -------------------------------------------------------------------------
  // Contagem de devices por status
  // -------------------------------------------------------------------------
  async getDeviceStatusCounts() {
    const [total, online, offline, warning] = await Promise.all([
      prisma.device.count({ where: { deleted: false } }),
      prisma.device.count({ where: { deleted: false, currentStatus: MonitoringStatus.ONLINE } }),
      prisma.device.count({ where: { deleted: false, currentStatus: MonitoringStatus.OFFLINE } }),
      prisma.device.count({ where: { deleted: false, currentStatus: MonitoringStatus.WARNING } })
    ]);

    return { total, online, offline, warning };
  }

  // -------------------------------------------------------------------------
  // Contagem de alertas não resolvidos por nível
  // -------------------------------------------------------------------------
  async getAlertCounts() {
    const results = await prisma.alert.groupBy({
      by: ['level'],
      where: { resolved: false },
      _count: { id: true }
    });

    let critical = 0;
    let warning = 0;
    let info = 0;

    for (const row of results) {
      if (row.level === 'CRITICAL') critical = row._count.id;
      if (row.level === 'WARNING') warning = row._count.id;
      if (row.level === 'INFO') info = row._count.id;
    }

    return { total: critical + warning + info, critical, warning, info };
  }

  // -------------------------------------------------------------------------
  // Distribuição de devices por tipo
  // -------------------------------------------------------------------------
  async getDevicesByType() {
    const results = await prisma.device.groupBy({
      by: ['type'],
      where: { deleted: false },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    return results.map((row) => ({
      type: row.type,
      total: row._count.id
    }));
  }

  // -------------------------------------------------------------------------
  // Últimos N alertas não resolvidos (mais recentes primeiro)
  // -------------------------------------------------------------------------
  async getRecentAlerts(limit: number = 10) {
    return prisma.alert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        level: true,
        acknowledged: true,
        resolved: true,
        createdAt: true,
        device: {
          select: { name: true, ipAddress: true }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // Últimos N logs de monitoramento (verificações mais recentes)
  // -------------------------------------------------------------------------
  async getRecentLogs(limit: number = 20) {
    return prisma.monitoringLog.findMany({
      orderBy: { checkedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        deviceId: true,
        status: true,
        responseTime: true,
        packetLoss: true,
        message: true,
        checkedAt: true,
        device: {
          select: { name: true, ipAddress: true }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // Top N devices com mais falhas nas últimas 24h
  // -------------------------------------------------------------------------
  async getTopUnreachable(limit: number = 5) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const results = await prisma.monitoringLog.groupBy({
      by: ['deviceId'],
      where: {
        status: MonitoringStatus.OFFLINE,
        checkedAt: { gte: since }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit
    });

    if (results.length === 0) return [];

    const deviceIds = results.map((r) => r.deviceId);

    const devices = await prisma.device.findMany({
      where: { id: { in: deviceIds } },
      select: { id: true, name: true, ipAddress: true }
    });

    const deviceMap = new Map(devices.map((d) => [d.id, d]));

    return results
      .map((row) => {
        const device = deviceMap.get(row.deviceId);
        if (!device) return null;
        return {
          deviceId: device.id,
          deviceName: device.name,
          deviceIp: device.ipAddress,
          failureCount: row._count.id
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
}