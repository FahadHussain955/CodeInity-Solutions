import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  formatMoney,
  paginatedResult,
  parsePagination,
  toNumber,
} from '../../utils/queryHelpers.js';
import { resolveShopFilter, shopWhere } from '../../utils/shopScope.js';

const REVIEW_LABEL = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  UNDER_REVIEW: 'Under Review',
  REJECTED: 'Rejected',
};

const REVIEW_FROM_INPUT = {
  active: 'ACTIVE',
  paused: 'PAUSED',
  'under review': 'UNDER_REVIEW',
  under_review: 'UNDER_REVIEW',
  rejected: 'REJECTED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  REJECTED: 'REJECTED',
  Active: 'ACTIVE',
  Paused: 'PAUSED',
  'Under Review': 'UNDER_REVIEW',
  Rejected: 'REJECTED',
};

const parseReviewStatus = (value) => {
  if (!value) return null;
  return REVIEW_FROM_INPUT[value] || REVIEW_FROM_INPUT[String(value).toLowerCase()] || null;
};

const moneyStr = (n) => toNumber(n).toFixed(2);

export const mapAd = (a) => ({
  id: a.id,
  code: a.code,
  campaignId: a.campaignId,
  campaignCode: a.campaign?.code || null,
  campaignDbId: a.campaignId,
  campaignName: a.campaign?.campaignName || null,
  adGroup: a.adGroup || null,
  name: a.title,
  title: a.title,
  format: a.mediaType,
  mediaType: a.mediaType,
  status: REVIEW_LABEL[a.reviewStatus] || a.reviewStatus,
  reviewStatus: a.reviewStatus,
  duration: a.duration,
  thumbnail: a.thumbnail,
  impressions: a.impressions,
  clicks: a.clicks,
  ctr: toNumber(a.ctr),
  conversions: a.conversions,
  spend: toNumber(a.spend),
  roas: toNumber(a.roas),
  caption: a.caption,
  mediaUrl: a.mediaUrl,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

const adInclude = {
  campaign: {
    select: { id: true, code: true, campaignName: true },
  },
};

const ownedCampaignFilter = (userId, shopId = null) => ({
  campaign: { userId, ...shopWhere(shopId) },
});

const buildWhere = (userId, query = {}, shopId = null) => {
  const where = { ...ownedCampaignFilter(userId, shopId) };
  const search = String(query.search || '').trim();
  const reviewStatus = parseReviewStatus(query.reviewStatus || query.status || query.filter);
  const campaignId = String(query.campaignId || '').trim();
  const and = [];

  if (search) {
    and.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } },
        { adGroup: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (reviewStatus) where.reviewStatus = reviewStatus;

  if (campaignId) {
    and.push({
      OR: [{ campaignId }, { campaign: { code: campaignId, userId } }],
    });
  }

  if (and.length === 1) Object.assign(where, and[0]);
  else if (and.length > 1) where.AND = and;

  return where;
};

const buildOrderBy = (sort) => {
  switch (String(sort || '').toLowerCase()) {
    case 'title':
    case 'name':
      return { title: 'asc' };
    case 'spend':
      return { spend: 'desc' };
    case 'impressions':
      return { impressions: 'desc' };
    case 'ctr':
      return { ctr: 'desc' };
    case 'roas':
      return { roas: 'desc' };
    case 'recent':
    default:
      return { createdAt: 'desc' };
  }
};

const nextAdCode = async () => {
  const latest = await prisma.adCreative.findFirst({
    orderBy: { code: 'desc' },
    select: { code: true },
  });
  const match = latest?.code?.match(/AD-(\d+)/i);
  const next = match ? Number(match[1]) + 1 : 1;
  return `AD-${String(next).padStart(3, '0')}`;
};

const resolveCampaignId = async (userId, campaignIdOrCode, shopId = null) => {
  if (!campaignIdOrCode) return null;
  const shopFilter = shopWhere(shopId);
  const byId = await prisma.campaign.findFirst({
    where: { id: campaignIdOrCode, userId, ...shopFilter },
  });
  if (byId) return byId.id;
  const byCode = await prisma.campaign.findFirst({
    where: { code: campaignIdOrCode, userId, ...shopFilter },
  });
  return byCode?.id || null;
};

const findAd = async (userId, idOrCode) => {
  let ad = await prisma.adCreative.findFirst({
    where: { id: idOrCode, ...ownedCampaignFilter(userId) },
    include: adInclude,
  });
  if (ad) return ad;
  return prisma.adCreative.findFirst({
    where: { code: idOrCode, ...ownedCampaignFilter(userId) },
    include: adInclude,
  });
};

export const adsService = {
  async list(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const shopId = await resolveShopFilter(userId, query.shopId);
    const where = buildWhere(userId, query, shopId);
    const orderBy = buildOrderBy(query.sort);

    const [total, rows] = await Promise.all([
      prisma.adCreative.count({ where }),
      prisma.adCreative.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: adInclude,
      }),
    ]);

    return paginatedResult({
      items: rows.map(mapAd),
      total,
      page,
      limit,
    });
  },

  async getById(userId, idOrCode) {
    const ad = await findAd(userId, idOrCode);
    if (!ad) throw ApiError.notFound('Ad creative not found.');
    return mapAd(ad);
  },

  async create(userId, payload) {
    const title = String(payload.name || payload.title || '').trim();
    if (!title) throw ApiError.badRequest('Ad title is required.');

    if (!payload.campaignId) {
      throw ApiError.badRequest('campaignId is required.');
    }

    // Optional shopId: campaign must belong to that shop (404 if mismatch).
    const shopId = await resolveShopFilter(userId, payload.shopId || payload.storeIntegrationId);
    const campaignId = await resolveCampaignId(userId, payload.campaignId, shopId);
    // Ownership-scoped lookup: missing or other-tenant campaign → 404 (IDOR-safe).
    if (!campaignId) throw ApiError.notFound('Campaign not found.');

    const code = payload.code || (await nextAdCode());
    const existing = await prisma.adCreative.findUnique({ where: { code } });
    if (existing) throw ApiError.conflict('An ad with this code already exists.');

    // New creatives always start under review; metrics start at zero.
    const ad = await prisma.adCreative.create({
      data: {
        code,
        campaignId,
        title,
        mediaUrl: payload.mediaUrl || null,
        mediaType: payload.format || payload.mediaType || 'In-Feed Video',
        duration: payload.duration || null,
        thumbnail: payload.thumbnail || null,
        caption: payload.caption || null,
        adGroup: payload.adGroup || null,
        reviewStatus: 'UNDER_REVIEW',
        impressions: 0,
        clicks: 0,
        ctr: '0.0000',
        conversions: 0,
        spend: moneyStr(0),
        roas: moneyStr(0),
      },
      include: adInclude,
    });

    return mapAd(ad);
  },

  async update(userId, idOrCode, payload) {
    const existing = await findAd(userId, idOrCode);
    if (!existing) throw ApiError.notFound('Ad creative not found.');

    const data = {};
    if (payload.name || payload.title) {
      data.title = String(payload.name || payload.title).trim();
    }
    if (payload.campaignId) {
      const campaignId = await resolveCampaignId(userId, payload.campaignId);
      if (!campaignId) throw ApiError.badRequest('Valid campaignId is required.');
      data.campaignId = campaignId;
    }
    if (payload.mediaUrl !== undefined) data.mediaUrl = payload.mediaUrl || null;
    if (payload.format || payload.mediaType) {
      data.mediaType = payload.format || payload.mediaType;
    }
    if (payload.duration !== undefined) data.duration = payload.duration || null;
    if (payload.thumbnail !== undefined) data.thumbnail = payload.thumbnail || null;
    if (payload.caption !== undefined) data.caption = payload.caption || null;
    if (payload.adGroup !== undefined) data.adGroup = payload.adGroup || null;
    if (payload.reviewStatus || payload.status) {
      const status = parseReviewStatus(payload.reviewStatus || payload.status);
      if (status) data.reviewStatus = status;
    }
    if (payload.impressions !== undefined) data.impressions = Number(payload.impressions) || 0;
    if (payload.clicks !== undefined) data.clicks = Number(payload.clicks) || 0;
    if (payload.ctr !== undefined) data.ctr = toNumber(payload.ctr).toFixed(4);
    if (payload.conversions !== undefined) data.conversions = Number(payload.conversions) || 0;
    if (payload.spend !== undefined) data.spend = moneyStr(payload.spend);
    if (payload.roas !== undefined) data.roas = moneyStr(payload.roas);

    const ad = await prisma.adCreative.update({
      where: { id: existing.id },
      data,
      include: adInclude,
    });

    return mapAd(ad);
  },

  async remove(userId, idOrCode) {
    const existing = await findAd(userId, idOrCode);
    if (!existing) throw ApiError.notFound('Ad creative not found.');
    await prisma.adCreative.delete({ where: { id: existing.id } });
    return { deleted: true, id: existing.id, code: existing.code };
  },

  async preview(userId, idOrCode) {
    const ad = await findAd(userId, idOrCode);
    if (!ad) throw ApiError.notFound('Ad creative not found.');
    const mapped = mapAd(ad);
    return {
      ...mapped,
      preview: {
        title: mapped.name,
        caption: mapped.caption,
        mediaUrl: mapped.mediaUrl,
        thumbnail: mapped.thumbnail,
        format: mapped.format,
        duration: mapped.duration,
        campaignName: mapped.campaignName,
        adGroup: mapped.adGroup,
      },
    };
  },

  async updateReviewStatus(userId, idOrCode, payload) {
    const existing = await findAd(userId, idOrCode);
    if (!existing) throw ApiError.notFound('Ad creative not found.');

    const reviewStatus = parseReviewStatus(payload.reviewStatus || payload.status);
    if (!reviewStatus) throw ApiError.badRequest('Valid reviewStatus is required.');

    const ad = await prisma.adCreative.update({
      where: { id: existing.id },
      data: { reviewStatus },
      include: adInclude,
    });

    return mapAd(ad);
  },

  async analytics(userId, query = {}) {
    const shopId = await resolveShopFilter(userId, query.shopId);
    const ads = await prisma.adCreative.findMany({
      where: ownedCampaignFilter(userId, shopId),
      include: adInclude,
    });
    const total = ads.length;
    const approved = ads.filter((a) => a.reviewStatus === 'ACTIVE').length;
    const underReview = ads.filter((a) => a.reviewStatus === 'UNDER_REVIEW').length;
    const paused = ads.filter((a) => a.reviewStatus === 'PAUSED').length;
    const rejected = ads.filter((a) => a.reviewStatus === 'REJECTED').length;

    const totalSpend = ads.reduce((s, a) => s + toNumber(a.spend), 0);
    const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
    const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
    const totalConversions = ads.reduce((s, a) => s + a.conversions, 0);
    const withSpend = ads.filter((a) => toNumber(a.spend) > 0);
    const avgRoas =
      withSpend.length === 0
        ? 0
        : withSpend.reduce((s, a) => s + toNumber(a.roas), 0) / withSpend.length;
    const avgCtr = totalImpressions ? (totalClicks / totalImpressions) * 100 : 0;
    const approvalRate = total ? Math.round((approved / total) * 100) : 0;

    return {
      totalAds: total,
      approved,
      underReview,
      paused,
      rejected,
      approvalRate,
      totalSpend,
      totalSpendFormatted: formatMoney(totalSpend),
      totalImpressions,
      totalClicks,
      totalConversions,
      avgRoas: Number(avgRoas.toFixed(2)),
      avgCtr: Number(avgCtr.toFixed(2)),
      topPerformers: ads
        .slice()
        .sort((a, b) => toNumber(b.roas) - toNumber(a.roas))
        .slice(0, 5)
        .map(mapAd),
    };
  },
};
