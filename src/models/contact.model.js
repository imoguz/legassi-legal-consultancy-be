"use strict";

const { Schema, model } = require("mongoose");

const contactSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
    },
    type: {
      type: String,
      enum: ["individual", "company"],
      default: "individual",
    },
    companyName: {
      type: String,
    },
    taxNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "contacts",
  }
);

module.exports = model("Contact", contactSchema);
