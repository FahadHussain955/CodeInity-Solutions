-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarPublicId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'INVENTORY', 'AI', 'SYNC', 'CAMPAIGN', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'Nexora TikTok Shop',
    "storeUrl" TEXT NOT NULL DEFAULT 'nexora.tiktok.com',
    "businessName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Pakistan',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "lowStockAlerts" BOOLEAN NOT NULL DEFAULT true,
    "orderNotifications" BOOLEAN NOT NULL DEFAULT true,
    "campaignNotifications" BOOLEAN NOT NULL DEFAULT true,
    "aiNotifications" BOOLEAN NOT NULL DEFAULT true,
    "customerNotifications" BOOLEAN NOT NULL DEFAULT false,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
    "planName" TEXT NOT NULL DEFAULT 'Growth',
    "planStatus" TEXT NOT NULL DEFAULT 'Active',
    "planRenewsAt" TIMESTAMP(3),
    "usageSeats" INTEGER NOT NULL DEFAULT 1,
    "usageOrders" INTEGER NOT NULL DEFAULT 0,
    "usageStorageMb" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_settings_userId_key" ON "user_settings"("userId");

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "message" TEXT NOT NULL,
    "icon" TEXT DEFAULT 'history',
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

CREATE TABLE IF NOT EXISTS "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "login_history_userId_createdAt_idx" ON "login_history"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "refresh_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "refresh_sessions_tokenHash_key" ON "refresh_sessions"("tokenHash");
CREATE INDEX IF NOT EXISTS "refresh_sessions_userId_revokedAt_idx" ON "refresh_sessions"("userId", "revokedAt");

ALTER TABLE "user_settings" DROP CONSTRAINT IF EXISTS "user_settings_userId_fkey";
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_userId_fkey";
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_userId_fkey";
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "login_history" DROP CONSTRAINT IF EXISTS "login_history_userId_fkey";
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "refresh_sessions" DROP CONSTRAINT IF EXISTS "refresh_sessions_userId_fkey";
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
