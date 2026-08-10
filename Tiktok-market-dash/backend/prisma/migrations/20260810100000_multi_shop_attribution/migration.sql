-- Multi-shop attribution: optional storeIntegrationId on commerce entities + uniqueness updates.

-- 1) Add nullable FK columns
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "storeIntegrationId" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "storeIntegrationId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "storeIntegrationId" TEXT;
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "storeIntegrationId" TEXT;
ALTER TABLE "audiences" ADD COLUMN IF NOT EXISTS "storeIntegrationId" TEXT;

-- 2) Backfill: assign each user's oldest connected shop (or any shop) to unscoped rows
UPDATE "products" p
SET "storeIntegrationId" = s.id
FROM (
  SELECT DISTINCT ON ("userId") "id", "userId"
  FROM "store_integrations"
  ORDER BY "userId", "isConnected" DESC, "createdAt" ASC
) s
WHERE p."userId" = s."userId"
  AND p."storeIntegrationId" IS NULL;

UPDATE "customers" c
SET "storeIntegrationId" = s.id
FROM (
  SELECT DISTINCT ON ("userId") "id", "userId"
  FROM "store_integrations"
  ORDER BY "userId", "isConnected" DESC, "createdAt" ASC
) s
WHERE c."userId" = s."userId"
  AND c."storeIntegrationId" IS NULL;

UPDATE "orders" o
SET "storeIntegrationId" = s.id
FROM (
  SELECT DISTINCT ON ("userId") "id", "userId"
  FROM "store_integrations"
  ORDER BY "userId", "isConnected" DESC, "createdAt" ASC
) s
WHERE o."userId" = s."userId"
  AND o."storeIntegrationId" IS NULL;

UPDATE "campaigns" c
SET "storeIntegrationId" = s.id
FROM (
  SELECT DISTINCT ON ("userId") "id", "userId"
  FROM "store_integrations"
  ORDER BY "userId", "isConnected" DESC, "createdAt" ASC
) s
WHERE c."userId" = s."userId"
  AND c."storeIntegrationId" IS NULL;

UPDATE "audiences" a
SET "storeIntegrationId" = s.id
FROM (
  SELECT DISTINCT ON ("userId") "id", "userId"
  FROM "store_integrations"
  ORDER BY "userId", "isConnected" DESC, "createdAt" ASC
) s
WHERE a."userId" = s."userId"
  AND a."storeIntegrationId" IS NULL;

-- 3) Foreign keys
DO $$ BEGIN
  ALTER TABLE "products"
    ADD CONSTRAINT "products_storeIntegrationId_fkey"
    FOREIGN KEY ("storeIntegrationId") REFERENCES "store_integrations"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "customers"
    ADD CONSTRAINT "customers_storeIntegrationId_fkey"
    FOREIGN KEY ("storeIntegrationId") REFERENCES "store_integrations"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "orders_storeIntegrationId_fkey"
    FOREIGN KEY ("storeIntegrationId") REFERENCES "store_integrations"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "campaigns"
    ADD CONSTRAINT "campaigns_storeIntegrationId_fkey"
    FOREIGN KEY ("storeIntegrationId") REFERENCES "store_integrations"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "audiences"
    ADD CONSTRAINT "audiences_storeIntegrationId_fkey"
    FOREIGN KEY ("storeIntegrationId") REFERENCES "store_integrations"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4) Indexes
CREATE INDEX IF NOT EXISTS "products_storeIntegrationId_idx" ON "products"("storeIntegrationId");
CREATE INDEX IF NOT EXISTS "customers_storeIntegrationId_idx" ON "customers"("storeIntegrationId");
CREATE INDEX IF NOT EXISTS "orders_storeIntegrationId_idx" ON "orders"("storeIntegrationId");
CREATE INDEX IF NOT EXISTS "campaigns_storeIntegrationId_idx" ON "campaigns"("storeIntegrationId");
CREATE INDEX IF NOT EXISTS "audiences_storeIntegrationId_idx" ON "audiences"("storeIntegrationId");

-- 5) Product SKU uniqueness: per-shop instead of global
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_sku_key";
DROP INDEX IF EXISTS "products_sku_key";
DO $$ BEGIN
  ALTER TABLE "products"
    ADD CONSTRAINT "products_storeIntegrationId_sku_key"
    UNIQUE ("storeIntegrationId", "sku");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6) Customer email uniqueness: per user + shop
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_userId_email_key";
DROP INDEX IF EXISTS "customers_userId_email_key";
DO $$ BEGIN
  ALTER TABLE "customers"
    ADD CONSTRAINT "customers_userId_storeIntegrationId_email_key"
    UNIQUE ("userId", "storeIntegrationId", "email");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
