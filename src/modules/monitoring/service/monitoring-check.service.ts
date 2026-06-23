import { MonitoringStatus, StatusSource } from '@prisma/client';
import { logger } from '@utils/logger';
import { icmpCheck } from '../utils/icmp-check';
import { tcpCheck } from '../utils/tcp-check';
import { MonitoringRepository } from '../repository/monitoring.repository';
import { AlertEngineService } from './alert-engine.service';

export class MonitoringCheckService {
  constructor(
    private readonly repository = new MonitoringRepository(),
    private readonly alertEngine = new AlertEngineService()
  ) {}

  // -------------------------------------------------------------------------
  // Ciclo principal — chamado pelo scheduler
  // -------------------------------------------------------------------------
  async runCycle(): Promise<void> {
    logger.info({ message: '[Monitor] Starting monitoring cycle' });

    const [devices, serviceMonitors] = await Promise.all([
      this.repository.findActiveDevices(),
      this.repository.findEnabledServiceMonitors()
    ]);

    logger.info({
      message: `[Monitor] Checking ${devices.length} devices and ${serviceMonitors.length} services`
    });

    // verificar todos os devices em paralelo (com limite de concorrência)
    await this.runWithConcurrencyLimit(
      devices.map((device) => () => this.checkDevice(device)),
      10
    );

    // verificar todos os serviços em paralelo
    await this.runWithConcurrencyLimit(
      serviceMonitors.map((sm) => () => this.checkService(sm)),
      10
    );

    logger.info({ message: '[Monitor] Cycle completed' });
  }

  // -------------------------------------------------------------------------
  // Verificação ICMP de um device
  // -------------------------------------------------------------------------
  private async checkDevice(device: {
    id: string;
    name: string;
    ipAddress: string;
    currentStatus: MonitoringStatus;
    statusSource: StatusSource;
  }): Promise<void> {
    try {
      const result = await icmpCheck(device.ipAddress, 5);

      const newStatus: MonitoringStatus = result.reachable
        ? MonitoringStatus.ONLINE
        : MonitoringStatus.OFFLINE;

      // gravar log
      await this.repository.createLog({
        deviceId: device.id,
        status: newStatus,
        responseTime: result.responseTime,
        packetLoss: result.packetLoss,
        message: result.message
      });

      const isManualOverride = device.statusSource === StatusSource.MANUAL;

      // se o status estiver forçado manualmente, o scheduler não o sobrepõe
      // mas mantém o registo "tocado" para que o device continue com updatedAt recente
      if (isManualOverride) {
        await this.repository.updateDeviceStatus(device.id, device.currentStatus);
      } else {
        // actualizar status do device
        await this.repository.updateDeviceStatus(device.id, newStatus);
      }

      // disparar lógica de alertas se status mudou
      if (!isManualOverride && device.currentStatus !== newStatus) {
        await this.alertEngine.handleDeviceStatusChange(device, newStatus);
      }

      logger.info({
        message: `[Monitor] Device checked`,
        device: device.name,
        ip: device.ipAddress,
        status: newStatus,
        responseTime: result.responseTime,
        mode: isManualOverride ? 'manual' : 'auto'
      });
    } catch (err) {
      logger.error({
        message: `[Monitor] Failed to check device`,
        device: device.name,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  // -------------------------------------------------------------------------
  // Verificação TCP de um serviço
  // -------------------------------------------------------------------------
  private async checkService(sm: {
    id: string;
    name: string;
    type: string;
    port: number;
    timeoutSeconds: number;
    deviceId: string;
    device: { id: string; name: string; ipAddress: string };
  }): Promise<void> {
    try {
      const result = await tcpCheck(
        sm.device.ipAddress,
        sm.port,
        sm.timeoutSeconds * 1000
      );

      const newStatus: MonitoringStatus = result.reachable
        ? MonitoringStatus.ONLINE
        : MonitoringStatus.OFFLINE;

      // o log de serviço vai para monitoringLog com mensagem identificando o serviço
      await this.repository.createLog({
        deviceId: sm.deviceId,
        status: newStatus,
        responseTime: result.responseTime,
        packetLoss: null,
        message: result.reachable
          ? `Service ${sm.type}:${sm.port} is up`
          : `Service ${sm.type}:${sm.port} is down — ${result.message}`
      });

      // disparar alerta se serviço caiu
      if (!result.reachable) {
        await this.alertEngine.handleServiceDown(sm, result.message);
      }

      logger.info({
        message: `[Monitor] Service checked`,
        service: sm.name,
        type: sm.type,
        port: sm.port,
        device: sm.device.name,
        reachable: result.reachable,
        responseTime: result.responseTime
      });
    } catch (err) {
      logger.error({
        message: `[Monitor] Failed to check service`,
        service: sm.name,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  // -------------------------------------------------------------------------
  // Controlo de concorrência — evita sobrecarregar a rede com 100 pings ao mesmo tempo
  // -------------------------------------------------------------------------
  private async runWithConcurrencyLimit(
    tasks: (() => Promise<void>)[],
    limit: number
  ): Promise<void> {
    const results: Promise<void>[] = [];
    const executing = new Set<Promise<void>>();

    for (const task of tasks) {
      const promise = task().finally(() => executing.delete(promise));
      results.push(promise);
      executing.add(promise);

      if (executing.size >= limit) {
        await Promise.race(executing);
      }
    }

    await Promise.all(results);
  }
}
