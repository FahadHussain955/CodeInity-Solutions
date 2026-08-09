import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { paginatedResult, parsePagination } from '../../utils/queryHelpers.js';

const mapNotification = (n) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  link: n.link,
  isRead: n.isRead,
  meta: n.meta,
  createdAt: n.createdAt,
  updatedAt: n.updatedAt,
});

export const notificationsService = {
  async list(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const where = { userId };
    if (query.unread === 'true' || query.unread === '1') {
      where.isRead = false;
    }
    if (query.type) {
      where.type = String(query.type).toUpperCase();
    }

    const [total, rows] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return paginatedResult({
      items: rows.map(mapNotification),
      total,
      page,
      limit,
    });
  },

  async unreadCount(userId) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  },

  async markRead(userId, id) {
    const existing = await prisma.notification.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Notification not found.');

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return mapNotification(updated);
  },

  async markAllRead(userId) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  },

  async remove(userId, id) {
    const existing = await prisma.notification.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Notification not found.');
    await prisma.notification.delete({ where: { id } });
    return { deleted: true, id };
  },
};
