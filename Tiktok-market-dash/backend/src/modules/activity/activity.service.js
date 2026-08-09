import { prisma } from '../../lib/prisma.js';
import { paginatedResult, parsePagination } from '../../utils/queryHelpers.js';

const mapActivity = (a) => ({
  id: a.id,
  action: a.action,
  entity: a.entity,
  entityId: a.entityId,
  message: a.message,
  icon: a.icon,
  meta: a.meta,
  createdAt: a.createdAt,
});

export const activityService = {
  async list(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const where = { userId };

    const [total, rows] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return paginatedResult({
      items: rows.map(mapActivity),
      total,
      page,
      limit,
    });
  },
};
