"use strict";

const Notification = require("../models/notification.model");
const { emitToUser } = require("../helpers/socket");

class NotificationService {
  static async createNotification(data) {
    try {
      const {
        user,
        title,
        message,
        type = "system",
        priority = "medium",
        relatedId,
        relatedModel,
        actionUrl,
        metadata = {},
        createdBy,
        expiresInDays = 30,
      } = data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const notification = await Notification.create({
        user,
        title,
        message,
        type,
        priority,
        relatedId,
        relatedModel,
        actionUrl,
        metadata,
        createdBy,
        expiresAt,
      });

      // Populate
      const populatedNotification = await Notification.findById(
        notification._id
      )
        .populate("user", "firstname lastname email profileUrl")
        .populate("createdBy", "firstname lastname");

      // Emit real-time notification
      await this.emitNotificationToUser(user, populatedNotification);

      return populatedNotification;
    } catch (error) {
      console.error("Notification creation error:", error);
      throw error;
    }
  }

  static async emitNotificationToUser(userId, notification) {
    try {
      const unreadCount = await Notification.countDocuments({
        user: userId,
        isRead: false,
      });

      const emitData = {
        notification: notification.formatForFrontend(),
        unreadCount,
        timestamp: new Date(),
      };

      return emitToUser(userId, "new-notification", emitData);
    } catch (error) {
      console.error("Notification emission error:", error);
      return false;
    }
  }

  static async createBulkNotifications(notificationsData) {
    try {
      const notifications = await Notification.insertMany(notificationsData);

      // Emit notifications to respective users
      const userNotifications = new Map();

      notifications.forEach((notification) => {
        if (!userNotifications.has(notification.user.toString())) {
          userNotifications.set(notification.user.toString(), []);
        }
        userNotifications.get(notification.user.toString()).push(notification);
      });

      for (const [userId, userNotifs] of userNotifications) {
        const unreadCount = await Notification.countDocuments({
          user: userId,
          isRead: false,
        });

        emitToUser(userId, "bulk-notifications", {
          notifications: userNotifs.map((n) => n.formatForFrontend()),
          unreadCount,
        });
      }

      return notifications;
    } catch (error) {
      console.error("Bulk notification creation error:", error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    return Notification.countDocuments({
      user: userId,
      isRead: false,
    });
  }

  static async cleanupExpiredNotifications() {
    return Notification.deleteMany({
      expiresAt: { $lte: new Date() },
    });
  }
}

module.exports = NotificationService;
