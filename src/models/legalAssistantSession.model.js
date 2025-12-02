"use strict";

const { Schema, model } = require("mongoose");

const legalAssistantSessionSchema = new Schema(
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
    conversationId: {
      type: String,
      index: true,
      sparse: true,
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
    collection: "legalAssistantSessions",
    timestamps: true,
  }
);

// Indexes for performance
legalAssistantSessionSchema.index({ conversationId: 1 });
legalAssistantSessionSchema.index({ user: 1, lastInteractionAt: -1 });

module.exports = model("LegalAssistantSession", legalAssistantSessionSchema);
