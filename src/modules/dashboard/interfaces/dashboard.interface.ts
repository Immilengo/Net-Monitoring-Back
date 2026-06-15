import { AlertLevel, DeviceType, MonitoringStatus } from '@prisma/client';

export interface DeviceStatusSummary {
  total: number;
  online: number;
  offline: number;
  warning: number;
}

export interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
}

export interface RecentAlert {
  id: string;
  title: string;
  level: AlertLevel;
  acknowledged: boolean;
  resolved: boolean;
  deviceName: string;
  deviceIp: string;
  createdAt: Date;
}

export interface RecentLog {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceIp: string;
  status: MonitoringStatus;
  responseTime: number | null;
  packetLoss: number | null;
  message: string | null;
  checkedAt: Date;
}

export interface DeviceByTypeSummary {
  type: DeviceType;
  total: number;
}

export interface TopUnreachableDevice {
  deviceId: string;
  deviceName: string;
  deviceIp: string;
  failureCount: number;
}

export interface DashboardOutput {
  devices: DeviceStatusSummary;
  alerts: AlertSummary;
  devicesByType: DeviceByTypeSummary[];
  recentAlerts: RecentAlert[];
  recentLogs: RecentLog[];
  topUnreachable: TopUnreachableDevice[];
  generatedAt: Date;
}