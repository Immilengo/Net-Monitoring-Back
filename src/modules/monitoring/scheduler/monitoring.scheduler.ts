import cron from 'node-cron';
import { env } from '@config/env';
import { logger } from '@utils/logger';
import { MonitoringCheckService } from '../service/monitoring-check.service';

let schedulerTask: cron.ScheduledTask | null = null;
let isRunning = false;

const checkService = new MonitoringCheckService();

export const startMonitoringScheduler = (): void => {
  if (!env.MONITOR_ENABLED) {
    logger.info({ message: '[Scheduler] Monitoring is disabled via MONITOR_ENABLED=false' });
    return;
  }

  const expression = env.MONITOR_CRON_EXPRESSION;

  if (!cron.validate(expression)) {
    logger.error({
      message: `[Scheduler] Invalid cron expression: "${expression}". Monitoring will not start.`
    });
    return;
  }

  schedulerTask = cron.schedule(expression, async () => {
    // evita sobreposição: se o ciclo anterior ainda não terminou, pula este
    if (isRunning) {
      logger.warn({ message: '[Scheduler] Previous cycle still running — skipping this tick' });
      return;
    }

    isRunning = true;
    try {
      await checkService.runCycle();
    } catch (err) {
      logger.error({
        message: '[Scheduler] Unhandled error in monitoring cycle',
        error: err instanceof Error ? err.message : String(err)
      });
    } finally {
      isRunning = false;
    }
  });

  logger.info({
    message: `[Scheduler] Monitoring scheduler started`,
    expression,
    description: 'Runs on schedule defined by MONITOR_CRON_EXPRESSION'
  });
};

export const stopMonitoringScheduler = (): void => {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    logger.info({ message: '[Scheduler] Monitoring scheduler stopped' });
  }
};