import { notificationsService } from './notifications.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const notificationsController = {
  list: asyncHandler(async (req, res) => {
    const data = await notificationsService.list(req.user.id, req.query);
    return ApiResponse.success(res, data, 'Notifications');
  }),

  unreadCount: asyncHandler(async (req, res) => {
    const data = await notificationsService.unreadCount(req.user.id);
    return ApiResponse.success(res, data, 'Unread count');
  }),

  markRead: asyncHandler(async (req, res) => {
    const data = await notificationsService.markRead(req.user.id, req.params.id);
    return ApiResponse.success(res, { notification: data }, 'Notification marked read');
  }),

  markAllRead: asyncHandler(async (req, res) => {
    const data = await notificationsService.markAllRead(req.user.id);
    return ApiResponse.success(res, data, 'All notifications marked read');
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await notificationsService.remove(req.user.id, req.params.id);
    return ApiResponse.success(res, data, 'Notification deleted');
  }),
};
