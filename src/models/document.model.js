const { Schema, model } = require("mongoose");
const allCategories = [
  // Litigation
  "Pleadings",
  "Motions",
  "Court Decisions",
  "Evidence",
  "Transcripts",
  "Affidavits",
  "Correspondence",
  "Notices",
  "Litigation Files",
  // General
  "Contracts",
  "Agreements",
  "Regulations",
  "Legal Opinions",
  "Corporate Documents",
  "Intellectual Property",
  "Employment Documents",
  "Financial Documents",
  "Compliance Documents",
  "Law Books",
  "Miscellaneous",
  "Other",
];

const documentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: allCategories,
      required: true,
    },
    documentType: {
      type: String,
      enum: ["public", "private"],
      required: true,
      default: "public",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matterId: {
      type: Schema.Types.ObjectId,
      ref: "Matter",
    },
  },
  {
    timestamps: true,
    collection: "documents",
  }
);

module.exports = model("Document", documentSchema);
