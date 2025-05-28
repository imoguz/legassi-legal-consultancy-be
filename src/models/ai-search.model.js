"use strict";

const { Schema, model } = require("mongoose");

const aiSearchSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    query: {
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
    collection: "aiSearches",
    timestamps: true,
  }
);

module.exports = model("AiSearch", aiSearchSchema);
