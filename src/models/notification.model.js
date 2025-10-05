"use strict";

const { Schema, model, Types } = require("mongoose");

const notificationSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["task", "calendar", "matter", "document", "system", "reminder"],
      default: "system",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    relatedId: {
      type: Types.ObjectId,
      index: true,
    },
    relatedModel: {
      type: String,
      enum: ["Task", "Matter", "CalendarEvent", "Document", "User"],
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
      expires: 0, // TTL index for auto-deletion
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "notifications",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1, isRead: 1 });
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
); // 30 days TTL

// Virtual for notification age
notificationSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method for bulk operations
notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany({ user: userId, isRead: false }, { isRead: true });
};

// Instance method for formatting
notificationSchema.methods.formatForFrontend = function () {
  return {
    id: this._id,
    title: this.title,
    message: this.message,
    type: this.type,
    priority: this.priority,
    isRead: this.isRead,
    actionUrl: this.actionUrl,
    relatedId: this.relatedId,
    createdAt: this.createdAt,
    metadata: this.metadata,
    ageInDays: this.ageInDays,
  };
};

module.exports = model("Notification", notificationSchema);
