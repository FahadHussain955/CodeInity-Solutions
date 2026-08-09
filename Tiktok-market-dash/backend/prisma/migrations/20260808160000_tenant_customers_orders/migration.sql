-- Tenant ownership for customers & orders (IDOR hardening)

-- Customers
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "userId" TEXT;

UPDATE "customers" c
SET "userId" = (
  SELECT u.id FROM "users" u
  WHERE u.email = 'demo@nexora.com' AND u."deletedAt" IS NULL
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
WHERE c."userId" IS NULL;

UPDATE "customers" c
SET "userId" = (
  SELECT u.id FROM "users" u
  WHERE u."deletedAt" IS NULL
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
WHERE c."userId" IS NULL;

DELETE FROM "customers" WHERE "userId" IS NULL;

ALTER TABLE "customers" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_email_key";

CREATE UNIQUE INDEX IF NOT EXISTS "customers_userId_email_key" ON "customers"("userId", "email");
CREATE INDEX IF NOT EXISTS "customers_userId_idx" ON "customers"("userId");

DO $$ BEGIN
  ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "userId" TEXT;

UPDATE "orders" o
SET "userId" = c."userId"
FROM "customers" c
WHERE o."customerId" = c.id AND o."userId" IS NULL;

UPDATE "orders" o
SET "userId" = (
  SELECT u.id FROM "users" u
  WHERE u.email = 'demo@nexora.com' AND u."deletedAt" IS NULL
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
WHERE o."userId" IS NULL;

DELETE FROM "orders" WHERE "userId" IS NULL;

ALTER TABLE "orders" ALTER COLUMN "userId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "orders_userId_idx" ON "orders"("userId");
CREATE INDEX IF NOT EXISTS "orders_userId_createdAt_idx" ON "orders"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
