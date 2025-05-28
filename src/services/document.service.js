const Document = require("../models/document.model");
const {
  uploadToCloudinaryBuffer,
  deleteFromCloudinary,
} = require("../helpers/cloudinary");

module.exports = {
  uploadDocument: async (req) => {
    if (!req.file) throw new Error("No file uploaded");

    const result = await uploadToCloudinaryBuffer(
      req.file.buffer,
      req.file.originalname
    );

    const doc = await Document.create({
      title: req.body.title,
      description: req.body.description,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedBy: req.user.id,
    });

    return doc;
  },

  getOneDocument: async (id) => {
    const doc = await Document.findById(id).populate(
      "uploadedBy",
      "firstname lastname"
    );

    if (!doc) throw new Error("Document not found");

    const fullName = doc.uploadedBy
      ? `${doc.uploadedBy.firstname} ${doc.uploadedBy.lastname}`
      : "Unknown";

    return {
      _id: doc._id,
      title: doc.title,
      description: doc.description,
      fileUrl: doc.fileUrl,
      createdAt: doc.createdAt,
      uploadedBy: fullName,
    };
  },

  getAllDocuments: async () => {
    const docs = await Document.find().populate(
      "uploadedBy",
      "firstname lastname"
    );
    return docs.map((doc) => {
      const fullName = doc.uploadedBy
        ? `${doc.uploadedBy.firstname} ${doc.uploadedBy.lastname}`
        : "Unknown";

      return {
        _id: doc._id,
        title: doc.title,
        description: doc.description,
        fileUrl: doc.fileUrl,
        createdAt: doc.createdAt,
        uploadedBy: fullName,
      };
    });
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
