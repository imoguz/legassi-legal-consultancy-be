const path = require("path");
const fs = require("fs").promises;
const Document = require("../models/document.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../helpers/cloudinary");

const deleteTempFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log("Temp file deleted");
  } catch (err) {
    console.warn("Temp file deletion skipped:", err.message);
  }
};

module.exports = {
  uploadDocument: async (req) => {
    if (!req.file) throw new Error("No file uploaded");

    const cloudinaryRes = await uploadToCloudinary(req.file.path);
    await deleteTempFile(req.file.path);

    const doc = await Document.create({
      title: req.body.title,
      description: req.body.description,
      fileUrl: cloudinaryRes.secure_url,
      cloudinaryId: cloudinaryRes.public_id,
      uploadedBy: req.user.id,
    });

    return doc;
  },

  getAllDocuments: async () => {
    return await Document.find().populate(
      "uploadedBy",
      "firstname lastname role"
    );
  },

  deleteDocument: async (id) => {
    const doc = await Document.findById(id);
    if (!doc) throw new Error("Document not found");

    await deleteFromCloudinary(doc.cloudinaryId);
    await doc.deleteOne();
  },

  updateDocument: async (id, data) => {
    const doc = await Document.findById(id);
    if (!doc) throw new Error("Document not found");

    doc.title = data.title || doc.title;
    doc.description = data.description || doc.description;
    return await doc.save();
  },
};
