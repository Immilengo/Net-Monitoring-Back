import { ServiceType } from '@prisma/client';

export interface ServiceMonitorDeviceOutput {
  id: string;
  name: string;
  ipAddress: string;
}

export interface ServiceMonitorOutput {
  id: string;
  name: string;
  type: ServiceType;
  port: number;
  enabled: boolean;
  timeoutSeconds: number;
  device: ServiceMonitorDeviceOutput;
  createdAt: Date;
  updatedAt: Date;
}