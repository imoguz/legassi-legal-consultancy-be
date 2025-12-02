// models/document.model.js
const { Schema, model } = require("mongoose");

const DocumentSchema = new Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary public ID
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    matter: { type: Schema.Types.ObjectId, ref: "Matter" },
    note: { type: Schema.Types.ObjectId, ref: "Matter.notes" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("Document", DocumentSchema);
