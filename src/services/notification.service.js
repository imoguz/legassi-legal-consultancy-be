"use strict";

const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const { emitToUser } = require("../helpers/socket");
const EmailNotificationService = require("./emailNotification.service");

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

      // User kontrolü
      const userDoc = await User.findById(user).select(
        "notificationPreferences isActive"
      );
      if (!userDoc || !userDoc.isActive) {
        throw new Error("User not found or inactive");
      }

      // Notification preferences kontrolü
      if (!userDoc.canReceiveNotification(type, priority)) {
        throw new Error(
          "User has disabled notifications for this type/priority"
        );
      }

      // Expiration date
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

      const populatedNotification = await Notification.findById(
        notification._id
      )
        .populate(
          "user",
          "firstname lastname email profileUrl notificationPreferences"
        )
        .populate("createdBy", "firstname lastname");

      // Real-time notification - TEK EVENT TİPİ
      const unreadCount = await this.getUnreadCount(user);
      emitToUser(user, "new-notification", {
        notification: populatedNotification.formatForFrontend(),
        unreadCount,
      });

      // Email notification
      this.sendEmailNotification(user, populatedNotification).catch((error) => {
        console.error("Email notification failed:", error);
      });

      return populatedNotification;
    } catch (error) {
      console.error("Notification creation error:", error);
      throw error;
    }
  }

  static async createBulkNotifications(notificationsData) {
    try {
      const filteredNotifications = [];
      const userCache = new Map();

      // Filter valid notifications based on user preferences
      for (const data of notificationsData) {
        if (!userCache.has(data.user.toString())) {
          const user = await User.findById(data.user).select(
            "notificationPreferences isActive"
          );
          userCache.set(data.user.toString(), user);
        }

        const user = userCache.get(data.user.toString());
        if (
          user &&
          user.isActive &&
          user.canReceiveNotification(data.type, data.priority)
        ) {
          filteredNotifications.push({
            ...data,
            expiresAt: new Date(
              Date.now() + (data.expiresInDays || 30) * 24 * 60 * 60 * 1000
            ),
          });
        }
      }

      const notifications = await Notification.insertMany(
        filteredNotifications
      );

      // ✅ TEK EVENT TİPİ - Her notification için ayrı ayrı new-notification emit et
      for (const notification of notifications) {
        const populatedNotification = await Notification.findById(
          notification._id
        )
          .populate(
            "user",
            "firstname lastname email profileUrl notificationPreferences"
          )
          .populate("createdBy", "firstname lastname");

        const unreadCount = await this.getUnreadCount(
          notification.user.toString()
        );

        // Aynı event tipi - frontend zaten bunu dinliyor
        emitToUser(notification.user.toString(), "new-notification", {
          notification: populatedNotification.formatForFrontend(),
          unreadCount,
        });

        // Email
        this.sendEmailNotification(
          notification.user.toString(),
          populatedNotification
        ).catch((error) => console.error("Bulk email failed:", error));
      }

      return notifications;
    } catch (error) {
      console.error("Bulk notification creation error:", error);
      throw error;
    }
  }

  static async sendEmailNotification(userId, notification) {
    try {
      await EmailNotificationService.sendNotificationEmail(
        userId,
        notification
      );
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  }

  static async emitNotificationToUser(userId, notification) {
    try {
      const unreadCount = await this.getUnreadCount(userId);

      emitToUser(userId, "new-notification", {
        notification: notification.formatForFrontend(),
        unreadCount,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Notification emission error:", error);
      return false;
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
