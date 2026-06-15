import { ServiceType } from '@prisma/client';

export interface CreateServiceMonitorDto {
  deviceId: string;
  name: string;
  type: ServiceType;
  port: number;
  enabled?: boolean;
  timeoutSeconds?: number;
}

export interface UpdateServiceMonitorDto {
  name?: string;
  type?: ServiceType;
  port?: number;
  enabled?: boolean;
  timeoutSeconds?: number;
}