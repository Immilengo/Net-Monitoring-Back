import { DeviceType } from '@prisma/client';

export interface CreateDeviceDto {
  name: string;
  hostname?: string;
  ipAddress: string;
  macAddress?: string;
  type: DeviceType;
  description?: string;
  siteId?: string;
}

export interface UpdateDeviceDto {
  name?: string;
  hostname?: string;
  ipAddress?: string;
  macAddress?: string;
  type?: DeviceType;
  description?: string;
  siteId?: string;
  active?: boolean;
}