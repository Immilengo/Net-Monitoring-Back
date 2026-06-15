import { AlertLevel } from '@prisma/client';

export interface AlertDeviceOutput {
  id: string;
  name: string;
  ipAddress: string;
}

export interface AlertOutput {
  id: string;
  title: string;
  message: string;
  level: AlertLevel;
  acknowledged: boolean;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  resolved: boolean;
  resolvedAt: Date | null;
  device: AlertDeviceOutput;
  createdAt: Date;
  updatedAt: Date;
}