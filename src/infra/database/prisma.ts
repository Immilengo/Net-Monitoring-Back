import { PrismaClient } from '@prisma/client';
import { databaseUrl } from '@config/env';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

export const prisma = new PrismaClient({
  log: ['warn', 'error']
});
