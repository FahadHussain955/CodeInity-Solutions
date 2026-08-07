import { prisma, connectDatabase, disconnectDatabase } from '../src/lib/prisma.js';

await connectDatabase();
const tables = await prisma.$queryRawUnsafe(
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
);
console.log('Connected OK');
console.log('Tables:', tables);
const users = await prisma.user.count();
console.log('User rows:', users);
await disconnectDatabase();
