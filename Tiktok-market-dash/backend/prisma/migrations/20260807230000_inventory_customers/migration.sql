-- Phase 6 & 7: Products, Inventory, Stock Movements, Customers, Orders

CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'ARCHIVED');
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'UNDER_REVIEW');
CREATE TYPE "StockAdjustmentType" AS ENUM ('RESTOCK', 'ADJUSTMENT', 'SALE', 'RESERVE', 'RELEASE', 'OUT_OF_STOCK', 'BULK');

CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "costPrice" DECIMAL(12,2),
    "image" TEXT,
    "description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE INDEX "products_name_idx" ON "products"("name");
CREATE INDEX "products_sku_idx" ON "products"("sku");

CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    "maxStockLevel" INTEGER NOT NULL DEFAULT 1000,
    "lastRestockedAt" TIMESTAMP(3),
    "lastMovementAt" TIMESTAMP(3),
    "warehouse" TEXT DEFAULT 'Main Warehouse',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "inventory_productId_key" ON "inventory"("productId");
CREATE INDEX "inventory_currentStock_idx" ON "inventory"("currentStock");
CREATE INDEX "inventory_updatedAt_idx" ON "inventory"("updatedAt");
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "previousQty" INTEGER NOT NULL,
    "newQty" INTEGER NOT NULL,
    "adjustmentType" "StockAdjustmentType" NOT NULL,
    "reason" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "stock_movements_productId_createdAt_idx" ON "stock_movements"("productId", "createdAt");
CREATE INDEX "stock_movements_inventoryId_createdAt_idx" ON "stock_movements"("inventoryId", "createdAt");
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "profileImage" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'Pakistan',
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "averageOrderValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastOrderDate" TIMESTAMP(3),
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
CREATE INDEX "customers_fullName_idx" ON "customers"("fullName");
CREATE INDEX "customers_email_idx" ON "customers"("email");
CREATE INDEX "customers_phone_idx" ON "customers"("phone");
CREATE INDEX "customers_status_idx" ON "customers"("status");
CREATE INDEX "customers_lastOrderDate_idx" ON "customers"("lastOrderDate");

CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX "orders_status_idx" ON "orders"("status");
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "lineTotal" DECIMAL(14,2) NOT NULL,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
