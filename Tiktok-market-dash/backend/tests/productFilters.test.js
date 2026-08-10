import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';
import { productsService } from '../src/modules/products/products.service.js';
import { getLowStockThreshold } from '../src/utils/lowStock.js';

const hasDb = async () => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

test('product list supports search + category + price + stockStatus filters', async (t) => {
  if (!(await hasDb())) {
    t.skip('database unavailable');
    return;
  }

  const user = await prisma.user.findFirst({
    where: { email: 'demo@nexora.com' },
    select: { id: true },
  });
  if (!user) {
    t.skip('demo user missing');
    return;
  }

  const shop = await prisma.storeIntegration.findFirst({
    where: { userId: user.id, isConnected: true },
    orderBy: { createdAt: 'asc' },
  });
  assert.ok(shop, 'expected a connected shop for demo user');

  const threshold = await getLowStockThreshold(user.id);
  const suffix = `flt-${Date.now()}`;

  const mk = async ({ name, sku, category, price, stock }) => {
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        storeIntegrationId: shop.id,
        name,
        sku,
        category,
        price,
        status: 'ACTIVE',
        inventory: {
          create: {
            currentStock: stock,
            reorderLevel: threshold,
            maxStockLevel: Math.max(stock, 100),
          },
        },
      },
      include: { inventory: true },
    });
    return product;
  };

  const pSearch = await mk({
    name: `Alpha Headphones ${suffix}`,
    sku: `SKU-ALPHA-${suffix}`.toUpperCase(),
    category: `Electronics-${suffix}`,
    price: 150,
    stock: threshold + 5,
  });
  const pLow = await mk({
    name: `Beta Cable ${suffix}`,
    sku: `SKU-BETA-${suffix}`.toUpperCase(),
    category: `Electronics-${suffix}`,
    price: 25,
    stock: Math.max(1, Math.min(threshold, 3)),
  });
  const pOut = await mk({
    name: `Gamma Empty ${suffix}`,
    sku: `SKU-GAMMA-${suffix}`.toUpperCase(),
    category: `Accessories-${suffix}`,
    price: 400,
    stock: 0,
  });

  try {
    const byName = await productsService.list(user.id, {
      search: `Alpha Headphones ${suffix}`,
      shopId: shop.id,
      limit: 50,
    });
    assert.ok(byName.items.some((p) => p.id === pSearch.id), 'search by name');

    const bySku = await productsService.list(user.id, {
      search: pSearch.sku,
      shopId: shop.id,
      limit: 50,
    });
    assert.ok(bySku.items.some((p) => p.id === pSearch.id), 'search by sku');

    const byCat = await productsService.list(user.id, {
      category: `Electronics-${suffix}`,
      shopId: shop.id,
      limit: 50,
    });
    assert.ok(byCat.items.every((p) => p.category.toLowerCase() === `electronics-${suffix}`));
    assert.ok(byCat.items.some((p) => p.id === pSearch.id));
    assert.ok(byCat.items.some((p) => p.id === pLow.id));
    assert.ok(!byCat.items.some((p) => p.id === pOut.id));

    const minPrice = await productsService.list(user.id, {
      minPrice: 100,
      shopId: shop.id,
      search: suffix,
      limit: 50,
    });
    assert.ok(minPrice.items.every((p) => p.price >= 100));
    assert.ok(minPrice.items.some((p) => p.id === pSearch.id));
    assert.ok(!minPrice.items.some((p) => p.id === pLow.id));

    const maxPrice = await productsService.list(user.id, {
      maxPrice: 50,
      shopId: shop.id,
      search: suffix,
      limit: 50,
    });
    assert.ok(maxPrice.items.every((p) => p.price <= 50));
    assert.ok(maxPrice.items.some((p) => p.id === pLow.id));

    const range = await productsService.list(user.id, {
      minPrice: 100,
      maxPrice: 200,
      shopId: shop.id,
      search: suffix,
      limit: 50,
    });
    assert.ok(range.items.every((p) => p.price >= 100 && p.price <= 200));
    assert.ok(range.items.some((p) => p.id === pSearch.id));

    const inStock = await productsService.list(user.id, {
      stockStatus: 'in_stock',
      shopId: shop.id,
      search: suffix,
      limit: 50,
    });
    assert.ok(inStock.items.every((p) => p.stock > threshold));
    assert.ok(inStock.items.some((p) => p.id === pSearch.id));
    assert.ok(!inStock.items.some((p) => p.id === pLow.id));
    assert.ok(!inStock.items.some((p) => p.id === pOut.id));

    const low = await productsService.list(user.id, {
      stockStatus: 'low_stock',
      shopId: shop.id,
      search: suffix,
      limit: 50,
    });
    assert.ok(low.items.every((p) => p.stock > 0 && p.stock <= threshold));
    assert.ok(low.items.some((p) => p.id === pLow.id));
    assert.ok(!low.items.some((p) => p.id === pOut.id));

    const out = await productsService.list(user.id, {
      stockStatus: 'out_of_stock',
      shopId: shop.id,
      search: suffix,
      limit: 50,
    });
    assert.ok(out.items.every((p) => p.stock <= 0));
    assert.ok(out.items.some((p) => p.id === pOut.id));

    const combined = await productsService.list(user.id, {
      category: `Electronics-${suffix}`,
      minPrice: 100,
      maxPrice: 200,
      stockStatus: 'in_stock',
      search: 'Headphones',
      shopId: shop.id,
      limit: 50,
    });
    assert.equal(combined.items.length, 1);
    assert.equal(combined.items[0].id, pSearch.id);

    let rejected = false;
    try {
      await productsService.list(user.id, { minPrice: 50, maxPrice: 10 });
    } catch {
      rejected = true;
    }
    assert.ok(rejected, 'min > max should reject');

    const cats = await productsService.categories(user.id, { shopId: shop.id });
    assert.ok(cats.items.includes(`Electronics-${suffix}`));
  } finally {
    await prisma.product.deleteMany({
      where: { id: { in: [pSearch.id, pLow.id, pOut.id] } },
    });
  }
});

test('product list rejects foreign shopId (IDOR)', async (t) => {
  if (!(await hasDb())) {
    t.skip('database unavailable');
    return;
  }

  const demo = await prisma.user.findFirst({ where: { email: 'demo@nexora.com' } });
  const admin = await prisma.user.findFirst({ where: { email: 'admin@nexora.com' } });
  if (!demo || !admin) {
    t.skip('demo/admin missing');
    return;
  }

  const foreignShop = await prisma.storeIntegration.findFirst({
    where: { userId: admin.id },
  });
  if (!foreignShop) {
    t.skip('admin shop missing');
    return;
  }

  let rejected = false;
  try {
    await productsService.list(demo.id, { shopId: foreignShop.id });
  } catch (err) {
    rejected = err?.statusCode === 404 || err?.status === 404;
  }
  assert.ok(rejected, 'foreign shopId must be rejected');
});
