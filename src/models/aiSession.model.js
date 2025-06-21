"use strict";

const { Schema, model } = require("mongoose");

const aiSessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: "New Chat",
    },
    lastInteractionAt: {
      type: Date,
      default: () => Date.now(),
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "ai_sessions",
    timestamps: true,
  }
);

module.exports = model("AiSession", aiSessionSchema);
