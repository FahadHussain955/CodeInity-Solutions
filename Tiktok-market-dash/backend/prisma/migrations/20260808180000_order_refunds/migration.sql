-- Refund domain + OrderStatus.REFUNDED

-- Enum value for full financial refunds
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';

CREATE TABLE IF NOT EXISTS "refunds" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "refunds_userId_idx" ON "refunds"("userId");
CREATE INDEX IF NOT EXISTS "refunds_orderId_idx" ON "refunds"("orderId");
CREATE INDEX IF NOT EXISTS "refunds_orderId_createdAt_idx" ON "refunds"("orderId", "createdAt");
CREATE INDEX IF NOT EXISTS "refunds_userId_createdAt_idx" ON "refunds"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "refunds" ADD CONSTRAINT "refunds_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "refunds" ADD CONSTRAINT "refunds_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
