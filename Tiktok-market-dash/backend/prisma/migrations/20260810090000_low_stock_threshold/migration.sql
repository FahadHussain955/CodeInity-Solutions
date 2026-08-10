-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "lowStockThreshold" INTEGER NOT NULL DEFAULT 10;
