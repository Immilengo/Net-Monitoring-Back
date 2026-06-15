import { MonitoringStatus } from '@prisma/client';
import { prisma } from '@infra/database/prisma';
import { logger } from '@utils/logger';

export class AlertEngineService {
  // -------------------------------------------------------------------------
  // Device mudou de status
  // -------------------------------------------------------------------------
  async handleDeviceStatusChange(
    device: { id: string; name: string; ipAddress: string },
    newStatus: MonitoringStatus
  ): Promise<void> {
    try {
      if (newStatus === MonitoringStatus.OFFLINE) {
        await prisma.alert.create({
          data: {
            deviceId: device.id,
            title: `Device offline: ${device.name}`,
            message: `Device ${device.name} (${device.ipAddress}) stopped responding to ping.`,
            level: 'CRITICAL'
          }
        });

        logger.warn({
          message: `[Alert] Device went OFFLINE`,
          device: device.name,
          ip: device.ipAddress
        });
      }

      if (newStatus === MonitoringStatus.ONLINE) {
        // resolver alertas CRITICAL abertos deste device automaticamente
        await prisma.alert.updateMany({
          where: {
            deviceId: device.id,
            resolved: false,
            level: 'CRITICAL'
          },
          data: {
            resolved: true
          }
        });

        logger.info({
          message: `[Alert] Device back ONLINE — alerts resolved`,
          device: device.name
        });
      }
    } catch (err) {
      logger.error({
        message: `[AlertEngine] Failed to handle device status change`,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  // -------------------------------------------------------------------------
  // Serviço está down
  // -------------------------------------------------------------------------
  async handleServiceDown(
    sm: { name: string; type: string; port: number; deviceId: string; device: { name: string; ipAddress: string } },
    errorMessage: string | null
  ): Promise<void> {
    try {
      // verifica se já existe alerta aberto para este serviço para não duplicar
      const existingAlert = await prisma.alert.findFirst({
        where: {
          deviceId: sm.deviceId,
          resolved: false,
          title: { contains: sm.type }
        }
      });

      if (existingAlert) return;

      await prisma.alert.create({
        data: {
          deviceId: sm.deviceId,
          title: `Service down: ${sm.type} on ${sm.device.name}`,
          message: `Service ${sm.name} (${sm.type}:${sm.port}) on device ${sm.device.name} (${sm.device.ipAddress}) is not responding. ${errorMessage ?? ''}`.trim(),
          level: 'WARNING'
        }
      });

      logger.warn({
        message: `[Alert] Service DOWN`,
        service: sm.name,
        type: sm.type,
        port: sm.port,
        device: sm.device.name
      });
    } catch (err) {
      logger.error({
        message: `[AlertEngine] Failed to handle service down`,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }
}