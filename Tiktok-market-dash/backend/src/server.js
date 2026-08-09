import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase, prisma } from './lib/prisma.js';
import { startCronJobs } from './jobs/index.js';
import { logger } from './utils/logger.js';

const start = async () => {
  let dbReady = false;

  try {
    await connectDatabase();
    dbReady = true;
    logger.info('PostgreSQL connected via Prisma');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL');
    logger.error(error.message);
    logger.warn('Tip: set DATABASE_URL in .env, or run: docker compose up -d');

    if (env.isProd) {
      process.exit(1);
    }

    logger.warn('Starting in degraded mode (development only)');
  }

  const server = app.listen(env.port, () => {
    logger.info(`Nexora API listening on http://localhost:${env.port}`);
    logger.info(`Health: http://localhost:${env.port}${env.apiPrefix}/health`);
    logger.info(`Environment: ${env.nodeEnv}`);
    logger.info(`Database: ${dbReady ? 'connected' : 'offline'}`);
    if (dbReady) {
      startCronJobs();
    }
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down`);
    server.close(async () => {
      try {
        await disconnectDatabase();
      } finally {
        process.exit(0);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
  });

  return { server, prisma };
};

start();
