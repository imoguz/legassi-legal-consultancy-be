"use strict";

const { Schema, model, Types } = require("mongoose");

const calendarEventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },

    matter: {
      type: Types.ObjectId,
      ref: "Matter",
    },
    task: {
      type: Types.ObjectId,
      ref: "Task",
    },
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    location: {
      type: String,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ["hearing", "meeting", "deadline", "reminder", "other"],
      default: "other",
    },
    color: {
      type: String,
      default: "#1890ff",
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
  { timestamps: true, collection: "calendarEvents" }
);

module.exports = model("CalendarEvent", calendarEventSchema);
