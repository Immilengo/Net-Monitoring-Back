import { MonitoringStatus } from '@prisma/client';

export interface MonitoringLogDeviceOutput {
  id: string;
  name: string;
  ipAddress: string;
  siteId: string | null;
  siteName: string | null;
}

export interface MonitoringLogOutput {
  id: string;
  status: MonitoringStatus;
  responseTime: number | null;
  packetLoss: number | null;
  message: string | null;
  checkedAt: Date;
  device: MonitoringLogDeviceOutput;
}

export interface MonitoringLogStatsOutput {
  deviceId: string;
  deviceName: string;
  deviceIp: string;
  totalChecks: number;
  onlineCount: number;
  offlineCount: number;
  warningCount: number;
  uptimePercent: number;
  avgResponseTime: number | null;
  avgPacketLoss: number | null;
  period: {
    from: Date;
    to: Date;
  };
}