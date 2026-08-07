import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase, prisma } from './lib/prisma.js';

const start = async () => {
  try {
    await connectDatabase();
    console.log('✓ PostgreSQL connected via Prisma');
  } catch (error) {
    console.error('✗ Failed to connect to PostgreSQL');
    console.error(error.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`✓ Nexora API listening on http://localhost:${env.port}`);
    console.log(`✓ Health: http://localhost:${env.port}${env.apiPrefix}/health`);
    console.log(`✓ Environment: ${env.nodeEnv}`);
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
