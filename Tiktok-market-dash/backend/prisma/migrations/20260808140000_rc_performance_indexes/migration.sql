-- RC performance indexes
CREATE INDEX IF NOT EXISTS "products_status_idx" ON "products"("status");
CREATE INDEX IF NOT EXISTS "customers_createdAt_idx" ON "customers"("createdAt");
CREATE INDEX IF NOT EXISTS "customers_totalSpent_idx" ON "customers"("totalSpent");
CREATE INDEX IF NOT EXISTS "orders_customerId_createdAt_idx" ON "orders"("customerId", "createdAt");
CREATE INDEX IF NOT EXISTS "orders_status_createdAt_idx" ON "orders"("status", "createdAt");
