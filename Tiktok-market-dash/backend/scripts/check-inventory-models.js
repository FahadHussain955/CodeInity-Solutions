import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

console.log('inventory typeof:', typeof prisma.inventory);
console.log('customer typeof:', typeof prisma.customer);
console.log('inventory count:', await prisma.inventory.count());
console.log('customer count:', await prisma.customer.count());

await prisma.$disconnect();
await pool.end();
