import { DeviceType, MonitoringStatus } from '@prisma/client';

export interface DeviceSiteOutput {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
}

export interface DeviceOutput {
  id: string;
  name: string;
  hostname: string | null;
  ipAddress: string;
  macAddress: string | null;
  type: DeviceType;
  description: string | null;
  currentStatus: MonitoringStatus;
  active: boolean;
  deleted: boolean;
  site: DeviceSiteOutput | null;
  createdAt: Date;
  updatedAt: Date;
}