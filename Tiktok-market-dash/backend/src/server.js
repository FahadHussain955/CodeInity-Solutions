import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase, prisma } from './lib/prisma.js';

const start = async () => {
  let dbReady = false;

  try {
    await connectDatabase();
    dbReady = true;
    console.log('✓ PostgreSQL connected via Prisma');
  } catch (error) {
    console.error('✗ Failed to connect to PostgreSQL');
    console.error(`  ${error.message}`);
    console.error('  Tip: set DATABASE_URL in .env, or run: docker compose up -d');

    if (env.isProd) {
      process.exit(1);
    }

    console.warn('⚠ Starting in degraded mode (development only)');
  }

  const server = app.listen(env.port, () => {
    console.log(`✓ Nexora API listening on http://localhost:${env.port}`);
    console.log(`✓ Health: http://localhost:${env.port}${env.apiPrefix}/health`);
    console.log(`✓ Environment: ${env.nodeEnv}`);
    console.log(`✓ Database: ${dbReady ? 'connected' : 'offline'}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down`);
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
    console.error('Unhandled rejection:', reason);
  });

  return { server, prisma };
};

start();
