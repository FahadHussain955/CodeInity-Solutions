import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  formatDate,
  formatMoney,
  paginatedResult,
  parsePagination,
  toNumber,
} from '../../utils/queryHelpers.js';
import {
  resolveShopFilter,
  resolveWritableShopId,
  shopWhere,
} from '../../utils/shopScope.js';

const STATUS_LABEL = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  UNDER_REVIEW: 'Under Review',
  DRAFT: 'Draft',
};

const OBJECTIVE_LABEL = {
  CONVERSIONS: 'Conversions',
  TRAFFIC: 'Traffic',
  AWARENESS: 'Awareness',
};

const STATUS_FROM_INPUT = {
  active: 'ACTIVE',
  paused: 'PAUSED',
  'under review': 'UNDER_REVIEW',
  under_review: 'UNDER_REVIEW',
  draft: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  DRAFT: 'DRAFT',
  Active: 'ACTIVE',
  Paused: 'PAUSED',
  'Under Review': 'UNDER_REVIEW',
  Draft: 'DRAFT',
};

const OBJECTIVE_FROM_INPUT = {
  conversions: 'CONVERSIONS',
  traffic: 'TRAFFIC',
  awareness: 'AWARENESS',
  CONVERSIONS: 'CONVERSIONS',
  TRAFFIC: 'TRAFFIC',
  AWARENESS: 'AWARENESS',
  Conversions: 'CONVERSIONS',
  Traffic: 'TRAFFIC',
  Awareness: 'AWARENESS',
};

const parseStatus = (value) => {
  if (!value) return null;
  return STATUS_FROM_INPUT[value] || STATUS_FROM_INPUT[String(value).toLowerCase()] || null;
};

const parseObjective = (value) => {
  if (!value) return null;
  return OBJECTIVE_FROM_INPUT[value] || OBJECTIVE_FROM_INPUT[String(value).toLowerCase()] || null;
};

const moneyStr = (n) => toNumber(n).toFixed(2);

const compactNumber = (n) => {
  const v = toNumber(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.round(v));
};

export const mapCampaign = (c) => {
  const adsCount = c._count?.creatives ?? c.creatives?.length ?? c.ads ?? 0;
  return {
    id: c.id,
    code: c.code,
    name: c.campaignName,
    campaignName: c.campaignName,
    objective: OBJECTIVE_LABEL[c.objective] || c.objective,
    objectiveRaw: c.objective,
    status: STATUS_LABEL[c.status] || c.status,
    statusRaw: c.status,
    platform: c.platform || 'TikTok',
    budget: toNumber(c.budget),
    dailyBudget: c.dailyBudget != null ? toNumber(c.dailyBudget) : null,
    spent: toNumber(c.totalSpend),
    totalSpend: toNumber(c.totalSpend),
    impressions: c.impressions,
    clicks: c.clicks,
    conversions: c.conversions,
    revenue: toNumber(c.revenue),
    roas: toNumber(c.roas),
    ctr: toNumber(c.ctr),
    cpc: toNumber(c.cpc),
    cpm: toNumber(c.cpm),
    startDate: formatDate(c.startDate),
    endDate: formatDate(c.endDate),
    startDateRaw: c.startDate,
    endDateRaw: c.endDate,
    adGroups: c.adGroups || 0,
    ads: adsCount,
    targeting: c.targeting || null,
    storeIntegrationId: c.storeIntegrationId || null,
    shopId: c.storeIntegrationId || null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
};

const campaignInclude = {
  _count: { select: { creatives: true } },
};

const buildWhere = (userId, query = {}, shopId = null) => {
  const where = { userId, ...shopWhere(shopId) };
  const search = String(query.search || '').trim();
  const status = parseStatus(query.status || query.filter);
  const platform = String(query.platform || '').trim();
  const objective = parseObjective(query.objective);

  if (search) {
    where.OR = [
      { campaignName: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) where.status = status;
  if (platform && platform.toLowerCase() !== 'all') where.platform = platform;
  if (objective) where.objective = objective;

  return where;
};

const buildOrderBy = (sort) => {
  switch (String(sort || '').toLowerCase()) {
    case 'name':
      return { campaignName: 'asc' };
    case 'spend':
    case 'spent':
    case 'total_spend':
      return { totalSpend: 'desc' };
    case 'roas':
      return { roas: 'desc' };
    case 'impressions':
      return { impressions: 'desc' };
    case 'budget':
      return { budget: 'desc' };
    case 'status':
      return { status: 'asc' };
    case 'recent':
    default:
      return { createdAt: 'desc' };
  }
};

const nextCampaignCode = async () => {
  const latest = await prisma.campaign.findFirst({
    orderBy: { code: 'desc' },
    select: { code: true },
  });
  const match = latest?.code?.match(/CMP-(\d+)/i);
  const next = match ? Number(match[1]) + 1 : 1;
  return `CMP-${String(next).padStart(3, '0')}`;
};

const findCampaign = async (userId, idOrCode) => {
  let campaign = await prisma.campaign.findFirst({
    where: { id: idOrCode, userId },
    include: campaignInclude,
  });
  if (campaign) return campaign;
  return prisma.campaign.findFirst({
    where: { code: idOrCode, userId },
    include: campaignInclude,
  });
};

export const campaignsService = {
  async list(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const shopId = await resolveShopFilter(userId, query.shopId);
    const where = buildWhere(userId, query, shopId);
    const orderBy = buildOrderBy(query.sort);

    const [total, rows] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: campaignInclude,
      }),
    ]);

    return paginatedResult({
      items: rows.map(mapCampaign),
      total,
      page,
      limit,
    });
  },

  async getById(userId, idOrCode) {
    const campaign = await findCampaign(userId, idOrCode);
    if (!campaign) throw ApiError.notFound('Campaign not found.');
    return mapCampaign(campaign);
  },

  async create(userId, payload) {
    const name = String(payload.name || payload.campaignName || '').trim();
    if (!name) throw ApiError.badRequest('Campaign name is required.');

    const code = payload.code || (await nextCampaignCode());
    const existing = await prisma.campaign.findUnique({ where: { code } });
    if (existing) throw ApiError.conflict('A campaign with this code already exists.');

    const status = parseStatus(payload.status) || 'DRAFT';
    const objective = parseObjective(payload.objective) || 'CONVERSIONS';
    const storeIntegrationId = await resolveWritableShopId(
      userId,
      payload.shopId || payload.storeIntegrationId
    );

    // Metrics start at zero on create — clients cannot invent performance data.
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        storeIntegrationId,
        code,
        campaignName: name,
        objective,
        platform: payload.platform || 'TikTok',
        status,
        budget: moneyStr(payload.budget ?? 0),
        dailyBudget:
          payload.dailyBudget != null && payload.dailyBudget !== ''
            ? moneyStr(payload.dailyBudget)
            : null,
        totalSpend: moneyStr(0),
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: moneyStr(0),
        roas: moneyStr(0),
        ctr: '0.0000',
        cpc: '0.0000',
        cpm: '0.0000',
        startDate: payload.startDate ? new Date(payload.startDate) : null,
        endDate: payload.endDate ? new Date(payload.endDate) : null,
        adGroups: Number(payload.adGroups) || 0,
        targeting: payload.targeting || undefined,
      },
      include: campaignInclude,
    });

    return mapCampaign(campaign);
  },

  async update(userId, idOrCode, payload) {
    const existing = await findCampaign(userId, idOrCode);
    if (!existing) throw ApiError.notFound('Campaign not found.');

    const data = {};
    if (payload.name || payload.campaignName) {
      data.campaignName = String(payload.name || payload.campaignName).trim();
    }
    if (payload.status) {
      const status = parseStatus(payload.status);
      if (status) data.status = status;
    }
    if (payload.objective) {
      const objective = parseObjective(payload.objective);
      if (objective) data.objective = objective;
    }
    if (payload.platform !== undefined) data.platform = payload.platform || 'TikTok';
    if (payload.budget !== undefined) data.budget = moneyStr(payload.budget);
    if (payload.dailyBudget !== undefined) {
      data.dailyBudget =
        payload.dailyBudget != null && payload.dailyBudget !== ''
          ? moneyStr(payload.dailyBudget)
          : null;
    }
    if (payload.spent !== undefined || payload.totalSpend !== undefined) {
      data.totalSpend = moneyStr(payload.spent ?? payload.totalSpend);
    }
    if (payload.impressions !== undefined) data.impressions = Number(payload.impressions) || 0;
    if (payload.clicks !== undefined) data.clicks = Number(payload.clicks) || 0;
    if (payload.conversions !== undefined) data.conversions = Number(payload.conversions) || 0;
    if (payload.revenue !== undefined) data.revenue = moneyStr(payload.revenue);
    if (payload.roas !== undefined) data.roas = moneyStr(payload.roas);
    if (payload.ctr !== undefined) data.ctr = toNumber(payload.ctr).toFixed(4);
    if (payload.cpc !== undefined) data.cpc = toNumber(payload.cpc).toFixed(4);
    if (payload.cpm !== undefined) data.cpm = toNumber(payload.cpm).toFixed(4);
    if (payload.startDate !== undefined) {
      data.startDate = payload.startDate ? new Date(payload.startDate) : null;
    }
    if (payload.endDate !== undefined) {
      data.endDate = payload.endDate ? new Date(payload.endDate) : null;
    }
    if (payload.adGroups !== undefined) data.adGroups = Number(payload.adGroups) || 0;
    if (payload.targeting !== undefined) data.targeting = payload.targeting;

    const campaign = await prisma.campaign.update({
      where: { id: existing.id },
      data,
      include: campaignInclude,
    });

    return mapCampaign(campaign);
  },

  async remove(userId, idOrCode) {
    const existing = await findCampaign(userId, idOrCode);
    if (!existing) throw ApiError.notFound('Campaign not found.');
    await prisma.campaign.delete({ where: { id: existing.id } });
    return { deleted: true, id: existing.id, code: existing.code };
  },

  async duplicate(userId, idOrCode) {
    const source = await findCampaign(userId, idOrCode);
    if (!source) throw ApiError.notFound('Campaign not found.');

    const code = await nextCampaignCode();
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        code,
        campaignName: `${source.campaignName} (Copy)`,
        objective: source.objective,
        platform: source.platform,
        status: 'DRAFT',
        budget: moneyStr(source.budget),
        dailyBudget: source.dailyBudget != null ? moneyStr(source.dailyBudget) : null,
        totalSpend: moneyStr(0),
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: moneyStr(0),
        roas: moneyStr(0),
        ctr: '0.0000',
        cpc: '0.0000',
        cpm: '0.0000',
        startDate: source.startDate,
        endDate: source.endDate,
        adGroups: source.adGroups,
        targeting: source.targeting || undefined,
      },
      include: campaignInclude,
    });

    return mapCampaign(campaign);
  },

  async analytics(userId, query = {}) {
    const shopId = await resolveShopFilter(userId, query.shopId);
    const campaigns = await prisma.campaign.findMany({
      where: { userId, ...shopWhere(shopId) },
    });

    const totalSpend = campaigns.reduce((s, c) => s + toNumber(c.totalSpend), 0);
    const totalRevenue = campaigns.reduce((s, c) => s + toNumber(c.revenue), 0);
    const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
    const withSpend = campaigns.filter((c) => toNumber(c.totalSpend) > 0);
    const avgRoas =
      withSpend.length === 0
        ? 0
        : withSpend.reduce((s, c) => s + toNumber(c.roas), 0) / withSpend.length;

    return {
      totalSpend: formatMoney(totalSpend),
      totalSpendRaw: totalSpend,
      totalRevenue: formatMoney(totalRevenue).replace(/\.00$/, ''),
      totalRevenueRaw: totalRevenue,
      avgRoas: avgRoas.toFixed(2),
      avgRoasRaw: avgRoas,
      totalImpressions: compactNumber(totalImpressions),
      totalImpressionsRaw: totalImpressions,
      totalClicks: compactNumber(totalClicks),
      totalClicksRaw: totalClicks,
      totalConversions: String(totalConversions),
      totalConversionsRaw: totalConversions,
      activeCampaigns: campaigns.filter((c) => c.status === 'ACTIVE').length,
      totalCampaigns: campaigns.length,
    };
  },
};
