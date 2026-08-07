import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';

export const healthService = {
  async getStatus() {
    let database = 'disconnected';

    try {
      await prisma.$queryRaw`SELECT 1`;
      database = 'connected';
    } catch {
      database = 'disconnected';
    }

    return {
      service: 'nexora-api',
      status: database === 'connected' ? 'ok' : 'degraded',
      version: '1.0.0',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      database,
    };
  },
};
