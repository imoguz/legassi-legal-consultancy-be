"use strict";

const { Schema, model } = require("mongoose");

const aiChatSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: "AiSession",
      required: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    collection: "ai_chats",
    timestamps: true,
  }
);

module.exports = model("AiChat", aiChatSchema);
