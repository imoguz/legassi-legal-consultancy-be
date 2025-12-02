"use strict";

const { Schema, model, Types } = require("mongoose");

const AssigneeSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const taskSchema = new Schema(
  {
    matter: {
      type: Types.ObjectId,
      ref: "Matter",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    assignees: [AssigneeSchema],

    dueDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "waiting", "completed", "cancelled"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    visibility: {
      type: String,
      enum: ["internal", "client", "team", "restricted"],
      default: "internal",
    },

    permittedUsers: [{ type: Types.ObjectId, ref: "User" }],

    attachments: [{ type: Types.ObjectId, ref: "Document" }],

    checklist: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    modifiedBy: {
      type: Types.ObjectId,
      ref: "User",
    },

    completedAt: { type: Date },

    estimatedMinutes: {
      type: Number,
    },

    actualMinutes: {
      type: Number,
    },
  },
  { timestamps: true, collection: "tasks" }
);

module.exports = model("Task", taskSchema);
