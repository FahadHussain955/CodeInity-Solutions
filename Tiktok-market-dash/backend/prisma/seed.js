import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const money = (n) => n.toFixed(2);
const DEMO_EMAIL = 'demo@nexora.com';
const DEMO_PASSWORD = 'Demo1234!';

async function ensureDemoUser() {
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      fullName: 'Nexora Demo',
      password: hashed,
      deletedAt: null,
      isEmailVerified: true,
      provider: 'local',
    },
    create: {
      fullName: 'Nexora Demo',
      email: DEMO_EMAIL,
      password: hashed,
      isEmailVerified: true,
      provider: 'local',
      role: 'admin',
    },
  });

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {
      storeName: 'Nexora TikTok Shop',
      timezone: 'Asia/Karachi',
      currency: 'USD',
    },
    create: {
      userId: user.id,
      storeName: 'Nexora TikTok Shop',
      businessName: 'Nexora Commerce',
      contactEmail: DEMO_EMAIL,
      timezone: 'Asia/Karachi',
      currency: 'USD',
    },
  });

  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: 'ORDER',
        title: 'New order received',
        message: 'Seed data includes sample orders ready for dashboard review.',
      },
      {
        userId: user.id,
        type: 'INVENTORY',
        title: 'Low stock attention',
        message: 'Several SKUs are at or below reorder level.',
      },
      {
        userId: user.id,
        type: 'AI',
        title: 'AI insights ready',
        message: 'Open AI Insights to review growth recommendations.',
      },
    ],
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'seed.completed',
      entity: 'System',
      message: 'Demo catalog and commerce data seeded',
      icon: 'database',
    },
  });

  return user;
}

async function main() {
  console.log('Seeding inventory, customers, campaigns, ads & audiences…');
  const demoUser = await ensureDemoUser();
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  // Clear dependent tables (keep users)
  await prisma.aiInsightCache.deleteMany();
  await prisma.campaignAudience.deleteMany();
  await prisma.adCreative.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.audience.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.storeIntegration.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  const productsData = [
    { name: 'Aura Pro Noise Cancelling Headphones', sku: 'AUR-PRO-NC-BLK', category: 'Electronics > Audio', price: 299, costPrice: 140, stock: 342, reserved: 18, reorder: 50, max: 500 },
    { name: 'Chrono M2 Smartwatch', sku: 'CHR-M2-SLV', category: 'Electronics > Wearables', price: 149.5, costPrice: 70, stock: 12, reserved: 3, reorder: 30, max: 200 },
    { name: 'USB-C Hub Pro', sku: 'USB-HUB-PRO', category: 'Electronics > Accessories', price: 59.99, costPrice: 22, stock: 5, reserved: 1, reorder: 20, max: 300 },
    { name: 'Ergo Mesh Office Chair', sku: 'ERG-CH-BLK', category: 'Furniture > Office', price: 399, costPrice: 180, stock: 0, reserved: 0, reorder: 10, max: 80 },
    { name: 'Desk Mat XL', sku: 'DSK-MAT-XL', category: 'Accessories > Desk', price: 34.99, costPrice: 12, stock: 8, reserved: 2, reorder: 15, max: 250 },
    { name: 'Mechanical Keyboard TKL', sku: 'KB-MEC-TKL', category: 'Electronics > Peripherals', price: 129, costPrice: 55, stock: 178, reserved: 12, reorder: 40, max: 400 },
    { name: 'LED Monitor 27"', sku: 'MON-LED-27', category: 'Electronics > Displays', price: 249, costPrice: 120, stock: 64, reserved: 8, reorder: 20, max: 150 },
  ];

  const products = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        userId: demoUser.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: money(p.price),
        costPrice: money(p.costPrice),
        status: 'ACTIVE',
        inventory: {
          create: {
            currentStock: p.stock,
            reservedStock: p.reserved,
            reorderLevel: p.reorder,
            maxStockLevel: p.max,
            lastRestockedAt: p.stock > 0 ? new Date('2026-07-15') : null,
            lastMovementAt: new Date('2026-08-01'),
            warehouse: 'Main Warehouse',
          },
        },
      },
      include: { inventory: true },
    });
    products.push(product);

    if (product.inventory) {
      await prisma.stockMovement.create({
        data: {
          inventoryId: product.inventory.id,
          productId: product.id,
          previousQty: 0,
          newQty: p.stock,
          adjustmentType: 'RESTOCK',
          reason: 'Initial seed stock',
        },
      });
    }
  }

  const customersData = [
    { fullName: 'Aisha Khan', email: 'aisha@email.com', phone: '+92 300 1234567', city: 'Islamabad', status: 'ACTIVE', joined: '2026-01-12', tags: ['VIP', 'Repeat Buyer', 'Electronics'] },
    { fullName: 'Bilal Ahmed', email: 'bilal@email.com', phone: '+92 321 9876543', city: 'Lahore', status: 'ACTIVE', joined: '2026-03-05', tags: ['Electronics'] },
    { fullName: 'Sara Malik', email: 'sara@email.com', phone: '+92 333 5551234', city: 'Karachi', status: 'ACTIVE', joined: '2025-11-20', tags: ['VIP', 'Repeat Buyer'] },
    { fullName: 'Usman Ali', email: 'usman@email.com', phone: '+92 345 7778888', city: 'Rawalpindi', status: 'ACTIVE', joined: '2026-07-30', tags: [] },
    { fullName: 'Fatima Noor', email: 'fatima@email.com', phone: '+92 311 2223333', city: 'Islamabad', status: 'INACTIVE', joined: '2026-02-14', tags: ['Repeat Buyer'] },
    { fullName: 'Hassan Raza', email: 'hassan@email.com', phone: '+92 322 4445555', city: 'Faisalabad', status: 'ACTIVE', joined: '2026-06-01', tags: [] },
    { fullName: 'Zara Sheikh', email: 'zara@email.com', phone: '+92 301 6667777', city: 'Lahore', status: 'ACTIVE', joined: '2025-12-08', tags: ['VIP', 'Electronics'] },
  ];

  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        userId: demoUser.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        city: c.city,
        country: 'Pakistan',
        status: c.status,
        tags: c.tags,
        createdAt: new Date(c.joined),
      },
    });
    customers.push(customer);
  }

  const orderDefs = [
    { customerIdx: 0, productIdx: 0, qty: 1, status: 'DELIVERED', date: '2026-08-03', payment: 'Card', orderNumber: 'ORD-1042' },
    { customerIdx: 1, productIdx: 1, qty: 1, status: 'PROCESSING', date: '2026-08-03', payment: 'COD', orderNumber: 'ORD-1041' },
    { customerIdx: 2, productIdx: 3, qty: 1, status: 'PENDING', date: '2026-08-02', payment: 'Card', orderNumber: 'ORD-1040' },
    { customerIdx: 3, productIdx: 0, qty: 1, status: 'DELIVERED', date: '2026-08-02', payment: 'Card', orderNumber: 'ORD-1039' },
    { customerIdx: 0, productIdx: 5, qty: 2, status: 'DELIVERED', date: '2026-07-20', payment: 'Card', orderNumber: 'ORD-1035' },
    { customerIdx: 2, productIdx: 6, qty: 1, status: 'DELIVERED', date: '2026-07-10', payment: 'Card', orderNumber: 'ORD-1030' },
    { customerIdx: 2, productIdx: 0, qty: 1, status: 'DELIVERED', date: '2026-06-15', payment: 'Card', orderNumber: 'ORD-1020' },
    { customerIdx: 6, productIdx: 1, qty: 1, status: 'DELIVERED', date: '2026-07-01', payment: 'Card', orderNumber: 'ORD-1025' },
    { customerIdx: 4, productIdx: 2, qty: 2, status: 'DELIVERED', date: '2026-05-12', payment: 'COD', orderNumber: 'ORD-1010' },
    { customerIdx: 5, productIdx: 4, qty: 1, status: 'CANCELLED', date: '2026-06-20', payment: 'Card', orderNumber: 'ORD-1015' },
  ];

  for (const o of orderDefs) {
    const customer = customers[o.customerIdx];
    const product = products[o.productIdx];
    const unitPrice = Number(product.price);
    const unitCost = product.costPrice != null ? Number(product.costPrice) : 0;
    const lineTotal = unitPrice * o.qty;

    await prisma.order.create({
      data: {
        userId: demoUser.id,
        orderNumber: o.orderNumber,
        customerId: customer.id,
        status: o.status,
        paymentMethod: o.payment,
        totalAmount: money(lineTotal),
        createdAt: new Date(o.date),
        updatedAt: new Date(o.date),
        items: {
          create: {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity: o.qty,
            unitPrice: money(unitPrice),
            unitCost: money(unitCost),
            lineTotal: money(lineTotal),
          },
        },
      },
    });
  }

  // Recompute customer aggregates from orders
  for (const customer of customers) {
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id, status: { not: 'CANCELLED' } },
    });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, ord) => sum + Number(ord.totalAmount), 0);
    const averageOrderValue = totalOrders ? totalSpent / totalOrders : 0;
    const lastOrderDate = orders.reduce((latest, ord) => {
      if (!latest || ord.createdAt > latest) return ord.createdAt;
      return latest;
    }, null);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders,
        totalSpent: money(totalSpent),
        averageOrderValue: money(averageOrderValue),
        lastOrderDate,
      },
    });
  }

  // ── Campaigns ──────────────────────────────────────────────
  const campaignsData = [
    {
      code: 'CMP-001',
      campaignName: 'Summer Sale - Headphones',
      objective: 'CONVERSIONS',
      status: 'ACTIVE',
      budget: 5000,
      totalSpend: 3241.8,
      impressions: 1_420_000,
      clicks: 28_400,
      conversions: 312,
      revenue: 93_288,
      roas: 28.78,
      ctr: 2.0,
      cpc: 0.11,
      cpm: 2.28,
      startDate: new Date('2026-07-15'),
      endDate: new Date('2026-08-15'),
      adGroups: 3,
    },
    {
      code: 'CMP-002',
      campaignName: 'Smartwatch Launch - Chrono M2',
      objective: 'TRAFFIC',
      status: 'ACTIVE',
      budget: 3000,
      totalSpend: 1876.5,
      impressions: 890_000,
      clicks: 15_300,
      conversions: 148,
      revenue: 22_052,
      roas: 11.75,
      ctr: 1.72,
      cpc: 0.12,
      cpm: 2.11,
      startDate: new Date('2026-07-22'),
      endDate: new Date('2026-08-22'),
      adGroups: 2,
    },
    {
      code: 'CMP-003',
      campaignName: 'Office Chair Awareness',
      objective: 'AWARENESS',
      status: 'PAUSED',
      budget: 2000,
      totalSpend: 2000,
      impressions: 2_100_000,
      clicks: 12_600,
      conversions: 67,
      revenue: 26_733,
      roas: 13.37,
      ctr: 0.6,
      cpc: 0.16,
      cpm: 0.95,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-07-01'),
      adGroups: 1,
    },
    {
      code: 'CMP-004',
      campaignName: 'Back to School Bundle',
      objective: 'CONVERSIONS',
      status: 'UNDER_REVIEW',
      budget: 4000,
      totalSpend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      roas: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      startDate: new Date('2026-08-05'),
      endDate: new Date('2026-09-05'),
      adGroups: 2,
    },
  ];

  const campaigns = [];
  for (const c of campaignsData) {
    const campaign = await prisma.campaign.create({
      data: {
        userId: demoUser.id,
        code: c.code,
        campaignName: c.campaignName,
        objective: c.objective,
        platform: 'TikTok',
        status: c.status,
        budget: money(c.budget),
        totalSpend: money(c.totalSpend),
        impressions: c.impressions,
        clicks: c.clicks,
        conversions: c.conversions,
        revenue: money(c.revenue),
        roas: money(c.roas),
        ctr: c.ctr.toFixed(4),
        cpc: c.cpc.toFixed(4),
        cpm: c.cpm.toFixed(4),
        startDate: c.startDate,
        endDate: c.endDate,
        adGroups: c.adGroups,
      },
    });
    campaigns.push(campaign);
  }

  const campaignByCode = Object.fromEntries(campaigns.map((c) => [c.code, c]));

  // ── Ad creatives ───────────────────────────────────────────
  const adsData = [
    {
      code: 'AD-001',
      campaignCode: 'CMP-001',
      title: 'Aura Pro - Bass Drop',
      adGroup: 'Interests - Tech',
      mediaType: 'In-Feed Video',
      reviewStatus: 'ACTIVE',
      duration: '15s',
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBmtIBAqnV3xVGOhKGR86G4JCgusTMInAvvVILs0cooHHw7tjVptFxYICkZBi-ewy32VJRJrufRTAncXkKhYvN_0Sr825GD3sMbGlL9kKCpR-ieFmrTe7vzniKWTDeDgw7C1X8qrtJTl1oRdQ5dfRBsXemOWKuWMj63Idi9cpFLZLUy53iInF1DyuJlpEc8yOCyPN0r_B4NdcIoQRPbxFD01y6_4GVzrn7lXDo8OtJyM4KKoxgxzIOg',
      impressions: 820_000,
      clicks: 16_400,
      ctr: 2.0,
      conversions: 190,
      spend: 1842,
      roas: 30.2,
      caption: "🎧 Feel every beat. Aura Pro - the last pair you'll ever buy. #AudioLovers #TechTok",
    },
    {
      code: 'AD-002',
      campaignCode: 'CMP-001',
      title: 'Aura Pro - Lifestyle',
      adGroup: 'Lookalike - Buyers',
      mediaType: 'In-Feed Video',
      reviewStatus: 'ACTIVE',
      duration: '30s',
      thumbnail: null,
      impressions: 600_000,
      clicks: 12_000,
      ctr: 2.0,
      conversions: 122,
      spend: 1399.8,
      roas: 26.1,
      caption: '✨ Work. Travel. Create. The Aura Pro fits every moment. Shop now!',
    },
    {
      code: 'AD-003',
      campaignCode: 'CMP-002',
      title: 'Chrono M2 - Feature Reel',
      adGroup: 'Interests - Fitness',
      mediaType: 'TopView',
      reviewStatus: 'ACTIVE',
      duration: '60s',
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCM5GtcuWM8jjj8O99wDQvraOUnU3rb2BTDK8wbqDteOWIB3X0vnkLaWZH0_5xvQtTIZUd1wwJjFAyx2ICRNW8EuYfarFqqKZxlHdh7xWc6xm0XQouSaQ4_f1ThxoBTutZhWPexmf2HuJx3fjN0Vd5Y9O6F03CINBbXiyKX9KlOVx_mesxfihYwJ_UyARez3oLlhe77gW7qlrwb-OrVtWINM7mhUISjusKqIQwymDPSdAxORabxPqPZ',
      impressions: 540_000,
      clicks: 9_720,
      ctr: 1.8,
      conversions: 98,
      spend: 1200,
      roas: 12.2,
      caption: '⌚ Meet the Chrono M2. Track everything. Miss nothing. #SmartWatch #FitnessTok',
    },
    {
      code: 'AD-004',
      campaignCode: 'CMP-003',
      title: 'Ergo Chair - WFH Routine',
      adGroup: 'Broad - WFH',
      mediaType: 'Spark Ad',
      reviewStatus: 'PAUSED',
      duration: '45s',
      thumbnail: null,
      impressions: 2_100_000,
      clicks: 12_600,
      ctr: 0.6,
      conversions: 67,
      spend: 2000,
      roas: 13.4,
      caption: '🏠 Work from home in style. The Ergo Mesh Chair changes your 9-to-5. #WFH #HomeOffice',
    },
    {
      code: 'AD-005',
      campaignCode: 'CMP-002',
      title: 'Chrono M2 - Retargeting',
      adGroup: 'Custom - Past Visitors',
      mediaType: 'In-Feed Video',
      reviewStatus: 'UNDER_REVIEW',
      duration: '15s',
      thumbnail: null,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0,
      spend: 0,
      roas: 0,
      caption: "👀 Still thinking about the Chrono M2? It's selling fast. #LimitedStock",
    },
  ];

  for (const a of adsData) {
    await prisma.adCreative.create({
      data: {
        code: a.code,
        campaignId: campaignByCode[a.campaignCode].id,
        title: a.title,
        adGroup: a.adGroup,
        mediaType: a.mediaType,
        reviewStatus: a.reviewStatus,
        duration: a.duration,
        thumbnail: a.thumbnail,
        caption: a.caption,
        impressions: a.impressions,
        clicks: a.clicks,
        ctr: a.ctr.toFixed(4),
        conversions: a.conversions,
        spend: money(a.spend),
        roas: money(a.roas),
      },
    });
  }

  // ── Audiences ──────────────────────────────────────────────
  const audiencesData = [
    {
      code: 'AUD-001',
      audienceName: 'Tech Enthusiasts 18-34',
      type: 'INTEREST',
      estimatedReach: '4.2M - 5.8M',
      reachMin: 4_200_000,
      reachMax: 5_800_000,
      status: 'READY',
      source: 'Interest Targeting',
      matchScore: 94,
      gender: 'All',
      ageRange: '18-34',
      countries: ['Pakistan', 'UAE', 'Saudi Arabia'],
      interests: ['Technology', 'Gadgets', 'Audio'],
      createdAt: new Date('2026-06-10'),
    },
    {
      code: 'AUD-002',
      audienceName: 'Lookalike - Buyers',
      type: 'LOOKALIKE',
      estimatedReach: '2.1M - 3.4M',
      reachMin: 2_100_000,
      reachMax: 3_400_000,
      status: 'READY',
      source: 'Customer List Upload',
      matchScore: 87,
      gender: 'All',
      ageRange: '18-44',
      countries: ['Pakistan', 'USA', 'UK'],
      interests: [],
      createdAt: new Date('2026-06-28'),
    },
    {
      code: 'AUD-003',
      audienceName: 'Website Visitors - 30d',
      type: 'CUSTOM',
      estimatedReach: '48K - 72K',
      reachMin: 48_000,
      reachMax: 72_000,
      status: 'READY',
      source: 'TikTok Pixel',
      matchScore: 100,
      gender: 'All',
      ageRange: '18-54',
      countries: ['Pakistan'],
      interests: [],
      createdAt: new Date('2026-07-01'),
    },
    {
      code: 'AUD-004',
      audienceName: 'WFH Professionals',
      type: 'INTEREST',
      estimatedReach: '6.0M - 9.2M',
      reachMin: 6_000_000,
      reachMax: 9_200_000,
      status: 'READY',
      source: 'Interest Targeting',
      matchScore: 91,
      gender: 'All',
      ageRange: '25-44',
      countries: ['Pakistan', 'UAE', 'Saudi Arabia', 'USA'],
      interests: ['Remote Work', 'Office Furniture', 'Productivity'],
      createdAt: new Date('2026-05-20'),
    },
    {
      code: 'AUD-005',
      audienceName: 'Cart Abandoners - 14d',
      type: 'CUSTOM',
      estimatedReach: '12K - 18K',
      reachMin: 12_000,
      reachMax: 18_000,
      status: 'POPULATING',
      source: 'TikTok Pixel',
      matchScore: 100,
      gender: 'All',
      ageRange: '18-44',
      countries: ['Pakistan'],
      interests: [],
      createdAt: new Date('2026-08-01'),
    },
  ];

  const audiences = [];
  for (const a of audiencesData) {
    const audience = await prisma.audience.create({
      data: {
        userId: demoUser.id,
        code: a.code,
        audienceName: a.audienceName,
        type: a.type,
        estimatedReach: a.estimatedReach,
        reachMin: a.reachMin,
        reachMax: a.reachMax,
        status: a.status,
        source: a.source,
        matchScore: a.matchScore,
        gender: a.gender,
        ageRange: a.ageRange,
        countries: a.countries,
        interests: a.interests,
        createdAt: a.createdAt,
      },
    });
    audiences.push(audience);
  }

  const audienceByCode = Object.fromEntries(audiences.map((a) => [a.code, a]));

  // Link campaign ↔ audiences (matching mock campaign counts)
  const links = [
    ['CMP-001', 'AUD-001'],
    ['CMP-001', 'AUD-002'],
    ['CMP-002', 'AUD-001'],
    ['CMP-003', 'AUD-004'],
    ['CMP-004', 'AUD-003'],
  ];

  for (const [cmpCode, audCode] of links) {
    await prisma.campaignAudience.create({
      data: {
        campaignId: campaignByCode[cmpCode].id,
        audienceId: audienceByCode[audCode].id,
      },
    });
  }

  console.log(
    `Seeded ${products.length} products/inventory, ${customers.length} customers, ${orderDefs.length} orders, ` +
      `${campaigns.length} campaigns, ${adsData.length} ads, ${audiences.length} audiences.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
