import { PrismaClient } from '@prisma/client';
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

export const prisma = globalForPrisma.__nexoraPrisma ?? createPrismaClient();

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
