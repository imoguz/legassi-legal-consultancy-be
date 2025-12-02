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

const docLibrarySchema = new Schema(
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
    fileSize: {
      type: String,
    },
    fileType: {
      type: String,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "docLibraries",
  }
);

module.exports = model("DocLibrary", docLibrarySchema);
