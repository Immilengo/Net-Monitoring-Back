import { MonitoringStatus } from '@prisma/client';

export interface CheckResult {
  deviceId: string;
  status: MonitoringStatus;
  responseTime: number | null;
  packetLoss: number | null;
  message: string | null;
}

export interface ServiceCheckResult {
  serviceMonitorId: string;
  deviceId: string;
  reachable: boolean;
  responseTime: number | null;
  message: string | null;
}