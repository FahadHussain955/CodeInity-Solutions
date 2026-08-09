import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  formatDate,
  paginatedResult,
  parsePagination,
} from '../../utils/queryHelpers.js';

const TYPE_LABEL = {
  INTEREST: 'Interest',
  LOOKALIKE: 'Lookalike',
  CUSTOM: 'Custom',
};

const STATUS_LABEL = {
  READY: 'Ready',
  POPULATING: 'Populating',
  ARCHIVED: 'Archived',
};

const TYPE_FROM_INPUT = {
  interest: 'INTEREST',
  lookalike: 'LOOKALIKE',
  custom: 'CUSTOM',
  INTEREST: 'INTEREST',
  LOOKALIKE: 'LOOKALIKE',
  CUSTOM: 'CUSTOM',
  Interest: 'INTEREST',
  Lookalike: 'LOOKALIKE',
  Custom: 'CUSTOM',
};

const STATUS_FROM_INPUT = {
  ready: 'READY',
  populating: 'POPULATING',
  archived: 'ARCHIVED',
  READY: 'READY',
  POPULATING: 'POPULATING',
  ARCHIVED: 'ARCHIVED',
  Ready: 'READY',
  Populating: 'POPULATING',
  Archived: 'ARCHIVED',
};

const parseType = (value) => {
  if (!value) return null;
  return TYPE_FROM_INPUT[value] || TYPE_FROM_INPUT[String(value).toLowerCase()] || null;
};

const parseStatus = (value) => {
  if (!value) return null;
  return STATUS_FROM_INPUT[value] || STATUS_FROM_INPUT[String(value).toLowerCase()] || null;
};

export const mapAudience = (a) => ({
  id: a.id,
  code: a.code,
  name: a.audienceName,
  audienceName: a.audienceName,
  type: TYPE_LABEL[a.type] || a.type,
  typeRaw: a.type,
  size: a.estimatedReach,
  estimatedReach: a.estimatedReach,
  reachMin: a.reachMin,
  reachMax: a.reachMax,
  status: STATUS_LABEL[a.status] || a.status,
  statusRaw: a.status,
  source: a.source,
  match: a.matchScore,
  matchScore: a.matchScore,
  campaigns: a._count?.campaigns ?? a.campaigns?.length ?? 0,
  createdAt: formatDate(a.createdAt),
  createdAtRaw: a.createdAt,
  gender: a.gender,
  ageRange: a.ageRange,
  countries: a.countries || [],
  interests: a.interests || [],
  updatedAt: a.updatedAt,
});

const audienceInclude = {
  _count: { select: { campaigns: true } },
};

const buildWhere = (userId, query = {}) => {
  const where = { userId };
  const search = String(query.search || '').trim();
  const type = parseType(query.type);
  const status = parseStatus(query.status || query.filter);

  if (search) {
    where.OR = [
      { audienceName: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { source: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (type) where.type = type;
  if (status) where.status = status;

  return where;
};

const buildOrderBy = (sort) => {
  switch (String(sort || '').toLowerCase()) {
    case 'name':
      return { audienceName: 'asc' };
    case 'match':
    case 'match_score':
      return { matchScore: 'desc' };
    case 'size':
    case 'reach':
      return { reachMax: 'desc' };
    case 'recent':
    default:
      return { createdAt: 'desc' };
  }
};

const nextAudienceCode = async () => {
  const latest = await prisma.audience.findFirst({
    orderBy: { code: 'desc' },
    select: { code: true },
  });
  const match = latest?.code?.match(/AUD-(\d+)/i);
  const next = match ? Number(match[1]) + 1 : 1;
  return `AUD-${String(next).padStart(3, '0')}`;
};

const findAudience = async (userId, idOrCode) => {
  let audience = await prisma.audience.findFirst({
    where: { id: idOrCode, userId },
    include: audienceInclude,
  });
  if (audience) return audience;
  return prisma.audience.findFirst({
    where: { code: idOrCode, userId },
    include: audienceInclude,
  });
};

const DEFAULT_DEMOGRAPHICS = {
  gender: [
    { label: 'Female', value: 54 },
    { label: 'Male', value: 44 },
    { label: 'Other', value: 2 },
  ],
  age: [
    { label: '13-17', value: 8 },
    { label: '18-24', value: 34 },
    { label: '25-34', value: 31 },
    { label: '35-44', value: 16 },
    { label: '45+', value: 11 },
  ],
  topRegions: [
    { country: 'Pakistan', share: 38 },
    { country: 'Saudi Arabia', share: 14 },
    { country: 'UAE', share: 11 },
    { country: 'USA', share: 9 },
    { country: 'UK', share: 7 },
  ],
};

export const audiencesService = {
  async list(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const where = buildWhere(userId, query);
    const orderBy = buildOrderBy(query.sort);

    const [total, rows] = await Promise.all([
      prisma.audience.count({ where }),
      prisma.audience.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: audienceInclude,
      }),
    ]);

    return paginatedResult({
      items: rows.map(mapAudience),
      total,
      page,
      limit,
    });
  },

  async getById(userId, idOrCode) {
    const audience = await findAudience(userId, idOrCode);
    if (!audience) throw ApiError.notFound('Audience not found.');
    return mapAudience(audience);
  },

  async create(userId, payload) {
    const name = String(payload.name || payload.audienceName || '').trim();
    if (!name) throw ApiError.badRequest('Audience name is required.');

    const code = payload.code || (await nextAudienceCode());
    const existing = await prisma.audience.findUnique({ where: { code } });
    if (existing) throw ApiError.conflict('An audience with this code already exists.');

    const type = parseType(payload.type) || 'INTEREST';
    const status = parseStatus(payload.status) || 'READY';

    const audience = await prisma.audience.create({
      data: {
        userId,
        code,
        audienceName: name,
        type,
        status,
        gender: payload.gender || null,
        ageRange: payload.ageRange || null,
        countries: Array.isArray(payload.countries) ? payload.countries : [],
        interests: Array.isArray(payload.interests) ? payload.interests : [],
        estimatedReach: payload.size || payload.estimatedReach || null,
        reachMin: payload.reachMin != null ? Number(payload.reachMin) : null,
        reachMax: payload.reachMax != null ? Number(payload.reachMax) : null,
        source: payload.source || null,
        matchScore: Number(payload.match ?? payload.matchScore) || 0,
      },
      include: audienceInclude,
    });

    return mapAudience(audience);
  },

  async update(userId, idOrCode, payload) {
    const existing = await findAudience(userId, idOrCode);
    if (!existing) throw ApiError.notFound('Audience not found.');

    const data = {};
    if (payload.name || payload.audienceName) {
      data.audienceName = String(payload.name || payload.audienceName).trim();
    }
    if (payload.type) {
      const type = parseType(payload.type);
      if (type) data.type = type;
    }
    if (payload.status) {
      const status = parseStatus(payload.status);
      if (status) data.status = status;
    }
    if (payload.gender !== undefined) data.gender = payload.gender || null;
    if (payload.ageRange !== undefined) data.ageRange = payload.ageRange || null;
    if (payload.countries !== undefined) {
      data.countries = Array.isArray(payload.countries) ? payload.countries : [];
    }
    if (payload.interests !== undefined) {
      data.interests = Array.isArray(payload.interests) ? payload.interests : [];
    }
    if (payload.size !== undefined || payload.estimatedReach !== undefined) {
      data.estimatedReach = payload.size || payload.estimatedReach || null;
    }
    if (payload.reachMin !== undefined) {
      data.reachMin = payload.reachMin != null ? Number(payload.reachMin) : null;
    }
    if (payload.reachMax !== undefined) {
      data.reachMax = payload.reachMax != null ? Number(payload.reachMax) : null;
    }
    if (payload.source !== undefined) data.source = payload.source || null;
    if (payload.match !== undefined || payload.matchScore !== undefined) {
      data.matchScore = Number(payload.match ?? payload.matchScore) || 0;
    }

    const audience = await prisma.audience.update({
      where: { id: existing.id },
      data,
      include: audienceInclude,
    });

    return mapAudience(audience);
  },

  async remove(userId, idOrCode) {
    const existing = await findAudience(userId, idOrCode);
    if (!existing) throw ApiError.notFound('Audience not found.');
    await prisma.audience.delete({ where: { id: existing.id } });
    return { deleted: true, id: existing.id, code: existing.code };
  },

  async analytics(userId) {
    const audiences = await prisma.audience.findMany({
      where: { userId },
      include: audienceInclude,
    });

    const total = audiences.length;
    const ready = audiences.filter((a) => a.status === 'READY').length;
    const populating = audiences.filter((a) => a.status === 'POPULATING').length;
    const byType = {
      Interest: audiences.filter((a) => a.type === 'INTEREST').length,
      Lookalike: audiences.filter((a) => a.type === 'LOOKALIKE').length,
      Custom: audiences.filter((a) => a.type === 'CUSTOM').length,
    };

    const countryCounts = {};
    for (const a of audiences) {
      for (const country of a.countries || []) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    }

    const totalCountryMentions = Object.values(countryCounts).reduce((s, n) => s + n, 0);
    const topRegions =
      totalCountryMentions === 0
        ? DEFAULT_DEMOGRAPHICS.topRegions
        : Object.entries(countryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([country, count]) => ({
              country,
              share: Math.round((count / totalCountryMentions) * 100),
            }));

    const demographics = {
      gender: DEFAULT_DEMOGRAPHICS.gender,
      age: DEFAULT_DEMOGRAPHICS.age,
      topRegions,
    };

    return {
      totalAudiences: total,
      ready,
      populating,
      byType,
      averageMatchScore:
        total === 0
          ? 0
          : Math.round(audiences.reduce((s, a) => s + a.matchScore, 0) / total),
      demographics,
      gender: demographics.gender,
      age: demographics.age,
      topRegions: demographics.topRegions,
    };
  },
};
