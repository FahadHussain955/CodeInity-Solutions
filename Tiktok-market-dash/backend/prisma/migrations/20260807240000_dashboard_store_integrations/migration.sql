-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('SHOPIFY', 'TIKTOK_SHOP', 'WOOCOMMERCE');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('IDLE', 'PENDING', 'SYNCING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "store_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeUrl" TEXT NOT NULL,
    "storeId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "syncProgress" INTEGER NOT NULL DEFAULT 0,
    "syncMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "details" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_integrations_userId_isConnected_idx" ON "store_integrations"("userId", "isConnected");

-- CreateIndex
CREATE INDEX "store_integrations_provider_idx" ON "store_integrations"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "store_integrations_userId_provider_storeUrl_key" ON "store_integrations"("userId", "provider", "storeUrl");

-- CreateIndex
CREATE INDEX "sync_logs_integrationId_createdAt_idx" ON "sync_logs"("integrationId", "createdAt");

-- CreateIndex
CREATE INDEX "sync_logs_userId_createdAt_idx" ON "sync_logs"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "store_integrations" ADD CONSTRAINT "store_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "store_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
