-- Growth domain ownership (campaigns + audiences). Creatives inherit via campaign.userId.

ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "userId" TEXT;

UPDATE "campaigns" c
SET "userId" = (
  SELECT u.id FROM "users" u
  WHERE u.email = 'demo@nexora.com' AND u."deletedAt" IS NULL
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
WHERE c."userId" IS NULL;

UPDATE "campaigns" c
SET "userId" = (
  SELECT u.id FROM "users" u
  WHERE u."deletedAt" IS NULL
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
WHERE c."userId" IS NULL;

DELETE FROM "campaigns" WHERE "userId" IS NULL;

ALTER TABLE "campaigns" ALTER COLUMN "userId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "campaigns_userId_idx" ON "campaigns"("userId");
CREATE INDEX IF NOT EXISTS "campaigns_userId_createdAt_idx" ON "campaigns"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "audiences" ADD COLUMN IF NOT EXISTS "userId" TEXT;

UPDATE "audiences" a
SET "userId" = (
  SELECT u.id FROM "users" u
  WHERE u.email = 'demo@nexora.com' AND u."deletedAt" IS NULL
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
WHERE a."userId" IS NULL;

UPDATE "audiences" a
SET "userId" = (
  SELECT u.id FROM "users" u
  WHERE u."deletedAt" IS NULL
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
WHERE a."userId" IS NULL;

DELETE FROM "audiences" WHERE "userId" IS NULL;

ALTER TABLE "audiences" ALTER COLUMN "userId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "audiences_userId_idx" ON "audiences"("userId");
CREATE INDEX IF NOT EXISTS "audiences_userId_createdAt_idx" ON "audiences"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "audiences" ADD CONSTRAINT "audiences_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
