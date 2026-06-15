import { app } from '@infra/http/app';
import { env } from '@config/env';
import { prisma } from '@infra/database/prisma';
import { redisClient } from '@infra/cache/redis';
import { logger } from '@utils/logger';
import { bootstrapAdmin } from '@modules/auth/service/bootstrap-admin.service';
import { startMonitoringScheduler, stopMonitoringScheduler } from '@modules/monitoring/scheduler/monitoring.scheduler';

const connectDatabaseIfAvailable = async () => {
  try {
    await prisma.$connect();
    await bootstrapAdmin();
    const connectDatabaseIfAvailable = async () => {
    try {
      await prisma.$connect();
      await bootstrapAdmin();
      startMonitoringScheduler(); // <- adicionar aqui
      logger.info({ message: 'Database connected and bootstrap completed' });
    } catch (error) {
      logger.warn({
        message: 'Database unavailable; API started without persistence-dependent bootstrap',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
    logger.info({ message: 'Database connected and bootstrap completed' });
  } catch (error) {
    logger.warn({
      message: 'Database unavailable; API started without persistence-dependent bootstrap',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
/*
const connectRedisIfAvailable = async () => {
  try {
    await redisClient.connect();
    logger.info({ message: 'Redis connected successfully' });
  } catch (error) {
    logger.warn({
      message: 'Redis unavailable; continuing without cache',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
*/
const server = app.listen(env.APP_PORT, async () => {
  logger.info({ message: `Startup: ${env.APP_NAME} on port ${env.APP_PORT}` });
  await connectDatabaseIfAvailable();
 // await connectRedisIfAvailable();
  logger.info({ message: 'HTTP server ready' });
});

const shutdown = async (signal: string) => {
  logger.info({ message: `Graceful shutdown started`, signal });
  server.close(async () => {
  stopMonitoringScheduler(); // <- adicionar aqui
  await prisma.$disconnect();
  logger.info({ message: 'Server closed successfully' });
  process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
