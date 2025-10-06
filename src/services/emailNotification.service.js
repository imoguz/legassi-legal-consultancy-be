"use strict";

const User = require("../models/user.model");
const {
  sendEmail,
  notificationEmailTemplate,
  bulkNotificationsTemplate,
} = require("../helpers/sendEmail");

class EmailNotificationService {
  static async canSendEmail(userId) {
    try {
      const user = await User.findById(userId).select(
        "notificationPreferences lastEmailNotificationAt isVerified"
      );

      if (!user || !user.notificationPreferences.email || !user.isVerified) {
        return false;
      }

      // Rate limiting
      if (user.lastEmailNotificationAt) {
        const timeSinceLastEmail =
          Date.now() - new Date(user.lastEmailNotificationAt).getTime();
        if (timeSinceLastEmail < 60000) {
          // 1 minutes
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking email permissions:", error);
      return false;
    }
  }

  static async sendNotificationEmail(userId, notification) {
    try {
      const canSend = await this.canSendEmail(userId);
      if (!canSend) return false;

      const user = await User.findById(userId).select(
        "email firstname lastname"
      );
      if (!user) return false;

      const subject = `🔔 ${
        notification.priority === "urgent" ? "🚨 URGENT: " : ""
      }${notification.title}`;
      const html = notificationEmailTemplate(notification, user);

      await sendEmail({
        to: user.email,
        subject,
        html,
      });

      // Update last email time
      await User.findByIdAndUpdate(userId, {
        lastEmailNotificationAt: new Date(),
      });

      console.log(`Notification email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error("Error sending notification email:", error);
      return false;
    }
  }

  static async sendBulkNotificationsEmail(userId, notifications) {
    try {
      const canSend = await this.canSendEmail(userId);
      if (!canSend) return false;

      const user = await User.findById(userId).select(
        "email firstname lastname"
      );
      if (!user) return false;

      const subject = `🔔 You have ${notifications.length} new notifications`;
      const html = bulkNotificationsTemplate(notifications, user);

      await sendEmail({
        to: user.email,
        subject,
        html,
      });

      // Update last email time
      await User.findByIdAndUpdate(userId, {
        lastEmailNotificationAt: new Date(),
      });

      console.log(`Bulk notifications email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error("Error sending bulk notifications email:", error);
      return false;
    }
  }

  // Batch processing
  static async processEmailNotificationsBatch(notifications) {
    const userNotifications = new Map();

    // Batch notifications based on user
    notifications.forEach((notification) => {
      if (!userNotifications.has(notification.user.toString())) {
        userNotifications.set(notification.user.toString(), []);
      }
      userNotifications.get(notification.user.toString()).push(notification);
    });

    const results = [];

    for (const [userId, userNotifs] of userNotifications) {
      try {
        if (userNotifs.length === 1) {
          // Single
          const sent = await this.sendNotificationEmail(userId, userNotifs[0]);
          results.push({ userId, sent, count: 1 });
        } else {
          // Bulk
          const sent = await this.sendBulkNotificationsEmail(
            userId,
            userNotifs
          );
          results.push({ userId, sent, count: userNotifs.length });
        }
      } catch (error) {
        console.error(`Error processing emails for user ${userId}:`, error);
        results.push({
          userId,
          sent: false,
          count: userNotifs.length,
          error: error.message,
        });
      }
    }

    return results;
  }
}

module.exports = EmailNotificationService;
