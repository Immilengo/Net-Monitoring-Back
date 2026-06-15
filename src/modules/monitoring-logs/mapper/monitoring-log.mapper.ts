import { MonitoringStatus } from '@prisma/client';
import { MonitoringLogOutput } from '../interfaces/monitoring-log.interface';

type InputLog = {
  id: string;
  status: MonitoringStatus;
  responseTime: number | null;
  packetLoss: number | null;
  message: string | null;
  checkedAt: Date;
  device: {
    id: string;
    name: string;
    ipAddress: string;
    siteId: string | null;
    site: { name: string } | null;
  };
};

export const toMonitoringLogOutput = (log: InputLog): MonitoringLogOutput => ({
  id: log.id,
  status: log.status,
  responseTime: log.responseTime,
  packetLoss: log.packetLoss,
  message: log.message,
  checkedAt: log.checkedAt,
  device: {
    id: log.device.id,
    name: log.device.name,
    ipAddress: log.device.ipAddress,
    siteId: log.device.siteId,
    siteName: log.device.site?.name ?? null
  }
});