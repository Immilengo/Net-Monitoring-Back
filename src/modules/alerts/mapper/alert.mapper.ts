import { AlertLevel } from '@prisma/client';
import { AlertOutput } from '../interfaces/alert.interface';

type InputAlert = {
  id: string;
  title: string;
  message: string;
  level: AlertLevel;
  acknowledged: boolean;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  resolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  device: {
    id: string;
    name: string;
    ipAddress: string;
  };
};

export const toAlertOutput = (alert: InputAlert): AlertOutput => ({
  id: alert.id,
  title: alert.title,
  message: alert.message,
  level: alert.level,
  acknowledged: alert.acknowledged,
  acknowledgedAt: alert.acknowledgedAt,
  acknowledgedBy: alert.acknowledgedBy,
  resolved: alert.resolved,
  resolvedAt: alert.resolvedAt,
  device: {
    id: alert.device.id,
    name: alert.device.name,
    ipAddress: alert.device.ipAddress
  },
  createdAt: alert.createdAt,
  updatedAt: alert.updatedAt
});