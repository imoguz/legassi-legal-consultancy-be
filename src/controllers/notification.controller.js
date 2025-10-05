"use strict";

const Notification = require("../models/notification.model");
const NotificationService = require("../services/notification.service");
const { emitToUser } = require("../helpers/socket");

module.exports = {
  createNotification: async (req, res, next) => {
    try {
      const {
        user,
        title,
        message,
        type,
        priority,
        relatedId,
        relatedModel,
        actionUrl,
        metadata,
      } = req.body;

      if (!user || !title) {
        return res.status(400).json({
          message: "User and title are required",
        });
      }

      const notification = await NotificationService.createNotification({
        user,
        title,
        message,
        type,
        priority,
        relatedId,
        relatedModel,
        actionUrl,
        metadata,
        createdBy: req.user.id,
      });

      return res.status(201).json({
        status: 201,
        data: notification.formatForFrontend(),
        message: "Notification created",
      });
    } catch (err) {
      next(err);
    }
  },

  listUserNotifications: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        isRead,
        type,
        priority,
        startDate,
        endDate,
      } = req.query;

      const filter = { user: req.user.id };

      // Filter
      if (isRead !== undefined) filter.isRead = isRead === "true";
      if (type) filter.type = type;
      if (priority) filter.priority = priority;

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const notifications = await Notification.find(filter)
        .populate("user", "firstname lastname email profileUrl")
        .populate("createdBy", "firstname lastname")
        .sort({ createdAt: -1, priority: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();

      const total = await Notification.countDocuments(filter);
      const unreadCount = await NotificationService.getUnreadCount(req.user.id);

      // Format notifications
      const formattedNotifications = notifications.map((notification) => ({
        ...notification,
        ageInDays: Math.floor(
          (Date.now() - new Date(notification.createdAt)) /
            (1000 * 60 * 60 * 24)
        ),
      }));

      return res.status(200).json({
        status: 200,
        data: {
          total,
          unreadCount,
          notifications: formattedNotifications,
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
        },
        message: "Notifications listed",
      });
    } catch (err) {
      next(err);
    }
  },

  getNotificationStats: async (req, res, next) => {
    try {
      const stats = await Notification.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: "$type",
            total: { $sum: 1 },
            unread: {
              $sum: { $cond: ["$isRead", 0, 1] },
            },
            highPriority: {
              $sum: {
                $cond: [{ $in: ["$priority", ["high", "urgent"]] }, 1, 0],
              },
            },
          },
        },
      ]);

      const totalUnread = await NotificationService.getUnreadCount(req.user.id);

      return res.status(200).json({
        status: 200,
        data: {
          byType: stats,
          totalUnread,
          summary: {
            total: stats.reduce((sum, stat) => sum + stat.total, 0),
            unread: totalUnread,
            highPriority: stats.reduce(
              (sum, stat) => sum + stat.highPriority,
              0
            ),
          },
        },
        message: "Fetched notification stats",
      });
    } catch (err) {
      next(err);
    }
  },

  getNotificationById: async (req, res, next) => {
    try {
      const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user.id,
      })
        .populate("user", "firstname lastname email profileUrl")
        .populate("createdBy", "firstname lastname");

      if (!notification) {
        return res.status(404).json({ message: "notification not found" });
      }

      return res.status(200).json({
        status: 200,
        data: notification.formatForFrontend(),
        message: "Fetched notification detail",
      });
    } catch (err) {
      next(err);
    }
  },

  markAsRead: async (req, res, next) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { isRead: true },
        { new: true }
      )
        .populate("user", "firstname lastname email profileUrl")
        .populate("createdBy", "firstname lastname");

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const unreadCount = await NotificationService.getUnreadCount(req.user.id);

      emitToUser(req.user.id, "notification-read", {
        notificationId: notification._id,
        unreadCount,
      });

      return res.status(200).json({
        status: 200,
        data: notification.formatForFrontend(),
        unreadCount,
        message: "Notification marked as read",
      });
    } catch (err) {
      next(err);
    }
  },

  markAllAsRead: async (req, res, next) => {
    try {
      const result = await Notification.markAllAsRead(req.user.id);
      const unreadCount = 0;

      emitToUser(req.user.id, "all-notifications-read", {
        count: result.modifiedCount,
        unreadCount,
      });

      return res.status(200).json({
        status: 200,
        data: { markedCount: result.modifiedCount },
        message: "All notifications marked as read",
      });
    } catch (err) {
      next(err);
    }
  },

  deleteNotification: async (req, res, next) => {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const unreadCount = await NotificationService.getUnreadCount(req.user.id);

      emitToUser(req.user.id, "notification-deleted", {
        notificationId: notification._id,
        unreadCount,
      });

      return res.status(200).json({
        status: 200,
        data: null,
        unreadCount,
        message: "Notification deleted",
      });
    } catch (err) {
      next(err);
    }
  },

  // Scheduled cleanup (admin only)
  cleanupNotifications: async (req, res, next) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const result = await NotificationService.cleanupExpiredNotifications();

      return res.status(200).json({
        status: 200,
        data: { deletedCount: result.deletedCount },
        message: "Clean up expired notifications",
      });
    } catch (err) {
      next(err);
    }
  },
};
