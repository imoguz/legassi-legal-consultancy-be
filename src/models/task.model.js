"use strict";

const { Schema, model, Types } = require("mongoose");

const taskSchema = new Schema(
  {
    matter: {
      type: Types.ObjectId,
      ref: "Matter",
      required: true,
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
    assignedTo: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ["open", "in-progress", "completed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, collection: "tasks" }
);

module.exports = model("Task", taskSchema);
