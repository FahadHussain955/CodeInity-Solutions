-- Product profitability: ownership + historical unit cost on line items
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "userId" TEXT;
CREATE INDEX IF NOT EXISTS "products_userId_idx" ON "products"("userId");

DO $$ BEGIN
  ALTER TABLE "products"
    ADD CONSTRAINT "products_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "unitCost" DECIMAL(12,2);
