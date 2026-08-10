import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '../config/env.js';

const globalForPrisma = globalThis;

const createPrismaClient = () => {
  const pool = new pg.Pool({ connectionString: env.databaseUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: env.isProd ? ['error'] : ['error', 'warn'],
  });
};

/** Invalidate cached client when schema fields (e.g. lowStockThreshold) are missing after generate. */
const isStaleClient = (client) =>
  !client ||
  typeof client.inventory?.count !== 'function' ||
  typeof client.customer?.count !== 'function' ||
  typeof client.storeIntegration?.count !== 'function' ||
  typeof client.campaign?.count !== 'function' ||
  !Prisma.UserSettingsScalarFieldEnum?.lowStockThreshold;

const cached = globalForPrisma.__nexoraPrisma;
export const prisma = isStaleClient(cached) ? createPrismaClient() : cached;

if (!env.isProd) {
  globalForPrisma.__nexoraPrisma = prisma;
}

export const connectDatabase = async () => {
  // Driver adapters may no-op $connect(); verify with a real query.
  await prisma.$queryRawUnsafe('SELECT 1');
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};
