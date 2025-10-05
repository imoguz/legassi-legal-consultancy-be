"use strict";

const NotificationService = require("../services/notification.service");

class NotificationHelper {
  static async notifyUsers(options) {
    const {
      recipients,
      title,
      message,
      type = "system",
      priority = "medium",
      relatedId,
      relatedModel,
      actionUrl,
      metadata = {},
      createdBy,
    } = options;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error("Valid recipients required");
    }

    const notificationsData = recipients.map((userId) => ({
      user: userId,
      title,
      message,
      type,
      priority,
      relatedId,
      relatedModel,
      actionUrl,
      metadata,
      createdBy,
    }));

    return NotificationService.createBulkNotifications(notificationsData);
  }

  // Matter-specific notifications
  static async notifyMatterUpdate(matter, updatedBy, changes = []) {
    const recipients = [
      matter.assignedAttorney,
      ...matter.teamMembers.map((tm) => tm.member),
    ].filter(
      (value, index, self) =>
        self.findIndex((v) => v.toString() === value.toString()) === index
    );

    return this.notifyUsers({
      recipients,
      title: "Matter updated",
      message: `${updatedBy.firstname} ${updatedBy.lastname} "${matter.title}" file updated`,
      type: "matter",
      relatedId: matter._id,
      relatedModel: "Matter",
      actionUrl: `/matters/${matter._id}`,
      metadata: { changes, matterTitle: matter.title },
      createdBy: updatedBy._id,
      priority: changes.includes("status") ? "high" : "medium",
    });
  }

  // Task-specific notifications
  static async notifyTaskAssignment(task, assignedBy) {
    const matter = task.matter; // Populated matter object

    const recipients = [
      task.assignedTo,
      matter.assignedAttorney,
      ...matter.teamMembers.map((tm) => tm.member),
    ].filter(
      (value, index, self) =>
        self.findIndex((v) => v.toString() === value.toString()) === index
    );

    return this.notifyUsers({
      recipients,
      title: "New Task Assigned",
      message: `${assignedBy.firstname} ${assignedBy.lastname} assigned "${task.title}" task to you`,
      type: "task",
      relatedId: task._id,
      relatedModel: "Task",
      actionUrl: `/tasks/${task._id}`,
      metadata: {
        taskTitle: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
      },
      createdBy: assignedBy._id,
      priority: task.priority === "high" ? "high" : "medium",
    });
  }

  // Calendar event notifications
  static async notifyCalendarEvent(event, createdBy, action = "created") {
    const actionMessages = {
      created: "created a new event",
      updated: "updated the event",
      deleted: "deleted the event",
    };

    return this.notifyUsers({
      recipients: event.participants,
      title: `Event ${
        action === "created"
          ? "Created"
          : action === "updated"
          ? "Updated"
          : "Deleted"
      }`,
      message: `${createdBy.firstname} ${createdBy.lastname} "${event.title}" ${actionMessages[action]}`,
      type: "calendar",
      relatedId: event._id,
      relatedModel: "CalendarEvent",
      actionUrl: action === "deleted" ? "/calendar" : `/calendar/${event._id}`,
      metadata: {
        eventTitle: event.title,
        startDate: event.startDate,
        eventType: event.eventType,
      },
      createdBy: createdBy._id,
      priority: event.eventType === "hearing" ? "high" : "medium",
    });
  }

  // Deadline reminders
  static async notifyDeadlineReminder(item, itemType, daysUntilDeadline) {
    const message =
      daysUntilDeadline === 0
        ? `The last day for "${item.title}" is today!`
        : `${daysUntilDeadline} days left for "${item.title}"`;

    let recipients = [];
    let actionUrl = "";

    if (itemType === "task") {
      recipients = [item.assignedTo];
      actionUrl = `/tasks/${item._id}`;
    } else if (itemType === "matter") {
      recipients = [
        item.assignedAttorney,
        ...item.teamMembers.map((tm) => tm.member),
      ];
      actionUrl = `/matters/${item._id}`;
    }

    return this.notifyUsers({
      recipients,
      title: "Deadline Reminder",
      message,
      type: "reminder",
      relatedId: item._id,
      relatedModel: itemType === "task" ? "Task" : "Matter",
      actionUrl,
      metadata: {
        itemTitle: item.title,
        deadline: item.dueDate || item.importantDates?.deadline,
        daysUntilDeadline,
      },
      priority: daysUntilDeadline <= 1 ? "urgent" : "high",
    });
  }
}

module.exports = NotificationHelper;
