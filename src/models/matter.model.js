const { Schema, model, Types } = require("mongoose");

const matterSchema = new Schema(
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
    matterNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    client: {
      type: Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    assignedAttorney: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamMembers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    matterType: {
      type: String,
      enum: ["lawsuit", "contract", "consultation", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
    relatedDocuments: [
      {
        type: Types.ObjectId,
        ref: "Document",
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    importantDates: {
      openingDate: {
        type: Date,
        default: Date.now,
      },
      deadline: Date,
      closedDate: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    court: {
      type: String,
      trim: true,
    },
    opposingParty: {
      type: String,
      trim: true,
    },
    feeType: {
      type: String,
      enum: ["fixed", "hourly"],
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
  { timestamps: true, collection: "matters" }
);

module.exports = model("Matter", matterSchema);
