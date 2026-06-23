import { DeviceType, MonitoringStatus, StatusSource } from '@prisma/client';
import { DeviceOutput } from '../interfaces/device.interface';

type InputDevice = {
  id: string;
  name: string;
  hostname: string | null;
  ipAddress: string;
  macAddress: string | null;
  type: DeviceType;
  description: string | null;
  currentStatus: MonitoringStatus;
  statusSource: StatusSource;
  active: boolean;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  site: {
    id: string;
    name: string;
    city: string | null;
    country: string | null;
  } | null;
};

export const toDeviceOutput = (device: InputDevice): DeviceOutput => ({
  id: device.id,
  name: device.name,
  hostname: device.hostname,
  ipAddress: device.ipAddress,
  macAddress: device.macAddress,
  type: device.type,
  description: device.description,
  currentStatus: device.currentStatus,
  statusSource: device.statusSource,
  active: device.active,
  deleted: device.deleted,
  site: device.site
    ? {
        id: device.site.id,
        name: device.site.name,
        city: device.site.city,
        country: device.site.country
      }
    : null,
  createdAt: device.createdAt,
  updatedAt: device.updatedAt
});
