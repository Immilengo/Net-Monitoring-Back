import { MonitoringStatus, Prisma } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

export class MonitoringRepository {
  async createLog(data: {
    deviceId: string;
    status: MonitoringStatus;
    responseTime?: number | null;
    packetLoss?: number | null;
    message?: string | null;
  }) {
    return prisma.monitoringLog.create({ data });
  }

  async updateDeviceStatus(deviceId: string, status: MonitoringStatus) {
    return prisma.device.update({
      where: { id: deviceId },
      data: { currentStatus: status }
    });
  }

  async findActiveDevices() {
    return prisma.device.findMany({
      where: { deleted: false, active: true },
      select: {
        id: true,
        name: true,
        ipAddress: true,
        currentStatus: true
      }
    });
  }

  async findEnabledServiceMonitors() {
    return prisma.serviceMonitor.findMany({
      where: {
        enabled: true,
        device: { deleted: false, active: true }
      },
      select: {
        id: true,
        name: true,
        type: true,
        port: true,
        timeoutSeconds: true,
        deviceId: true,
        device: {
          select: { id: true, name: true, ipAddress: true }
        }
      }
    });
  }

  async findLatestLogByDevice(deviceId: string) {
    return prisma.monitoringLog.findFirst({
      where: { deviceId },
      orderBy: { checkedAt: 'desc' }
    });
  }
}