import { DashboardRepository } from '../repository/dashboard.repository';
import { DashboardOutput } from '../interfaces/dashboard.interface';

export class DashboardService {
  constructor(private readonly repository = new DashboardRepository()) {}

  async getSummary(): Promise<DashboardOutput> {
    // todas as queries em paralelo — uma única ida à base de dados por grupo
    const [
      deviceCounts,
      alertCounts,
      devicesByType,
      recentAlerts,
      recentLogs,
      topUnreachable
    ] = await Promise.all([
      this.repository.getDeviceStatusCounts(),
      this.repository.getAlertCounts(),
      this.repository.getDevicesByType(),
      this.repository.getRecentAlerts(10),
      this.repository.getRecentLogs(20),
      this.repository.getTopUnreachable(5)
    ]);

    return {
      devices: {
        total: deviceCounts.total,
        online: deviceCounts.online,
        offline: deviceCounts.offline,
        warning: deviceCounts.warning
      },
      alerts: {
        total: alertCounts.total,
        critical: alertCounts.critical,
        warning: alertCounts.warning,
        info: alertCounts.info
      },
      devicesByType,
      recentAlerts: recentAlerts.map((a) => ({
        id: a.id,
        title: a.title,
        level: a.level,
        acknowledged: a.acknowledged,
        resolved: a.resolved,
        deviceName: a.device.name,
        deviceIp: a.device.ipAddress,
        createdAt: a.createdAt
      })),
      recentLogs: recentLogs.map((l) => ({
        id: l.id,
        deviceId: l.deviceId,
        deviceName: l.device.name,
        deviceIp: l.device.ipAddress,
        status: l.status,
        responseTime: l.responseTime,
        packetLoss: l.packetLoss,
        message: l.message,
        checkedAt: l.checkedAt
      })),
      topUnreachable,
      generatedAt: new Date()
    };
  }

  // -------------------------------------------------------------------------
  // Endpoint mais leve para polling frequente do frontend
  // Devolve apenas os contadores — sem logs nem alertas detalhados
  // -------------------------------------------------------------------------
  async getCounters() {
    const [deviceCounts, alertCounts] = await Promise.all([
      this.repository.getDeviceStatusCounts(),
      this.repository.getAlertCounts()
    ]);

    return {
      devices: deviceCounts,
      alerts: alertCounts,
      generatedAt: new Date()
    };
  }
}