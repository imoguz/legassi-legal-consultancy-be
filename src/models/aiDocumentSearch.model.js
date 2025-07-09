"use strict";

const { Schema, model } = require("mongoose");

const aiDocumentSearchSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    matchedDocuments: [
      {
        document: {
          type: Schema.Types.ObjectId,
          ref: "Document",
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    collection: "aiDocumentSearches",
    timestamps: true,
  }
);

module.exports = model("AiDocumentSearch", aiDocumentSearchSchema);
