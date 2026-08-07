import { prisma, connectDatabase, disconnectDatabase } from './src/lib/prisma.js';

try {
  await connectDatabase();
  console.log('connect ok');
  const r = await prisma.$queryRawUnsafe('SELECT 1 AS ok');
  console.log('queryRawUnsafe', r);
} catch (e) {
  console.error('ERR', e.constructor?.name, e.message, e.code);
  if (e.meta) console.error('meta', e.meta);
  console.error(e.stack);
} finally {
  await disconnectDatabase();
}
