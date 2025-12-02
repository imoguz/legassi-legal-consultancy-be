const { Schema, model, Types } = require("mongoose");

const teamMemberSchema = new Schema(
  {
    member: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const opposingPartySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          const hasAnyField =
            value || this.representative || this.phone || this.email;
          if (hasAnyField && !value) {
            return false;
          }
          return true;
        },
        message: "Name is required if any opposing party field is provided.",
      },
    },
    representative: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false }
);

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
    teamMembers: [teamMemberSchema],
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
    opposingParty: opposingPartySchema,
    feeType: {
      type: String,
      enum: ["fixed", "hourly"],
    },
    feeAmount: {
      type: Number,
    },
    currency: {
      type: String,
      default: "USD",
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
