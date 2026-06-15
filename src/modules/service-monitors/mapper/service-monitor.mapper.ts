import { ServiceType } from '@prisma/client';
import { ServiceMonitorOutput } from '../interfaces/service-monitor.interface';

type InputServiceMonitor = {
  id: string;
  name: string;
  type: ServiceType;
  port: number;
  enabled: boolean;
  timeoutSeconds: number;
  createdAt: Date;
  updatedAt: Date;
  device: {
    id: string;
    name: string;
    ipAddress: string;
  };
};

export const toServiceMonitorOutput = (sm: InputServiceMonitor): ServiceMonitorOutput => ({
  id: sm.id,
  name: sm.name,
  type: sm.type,
  port: sm.port,
  enabled: sm.enabled,
  timeoutSeconds: sm.timeoutSeconds,
  device: {
    id: sm.device.id,
    name: sm.device.name,
    ipAddress: sm.device.ipAddress
  },
  createdAt: sm.createdAt,
  updatedAt: sm.updatedAt
});