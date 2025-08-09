"use strict";

const Document = require("../models/document.model");
const {
  uploadToCloudinaryBuffer,
  deleteFromCloudinary,
} = require("../helpers/cloudinary");

module.exports = {
  uploadDocument: async (req, res) => {
    try {
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

      res.status(201).send(doc);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  getDocument: async (req, res) => {
    try {
      const doc = await Document.findById(req.params.id).populate(
        "uploadedBy",
        "firstname lastname"
      );
      if (!doc) throw new Error("Document not found");

      res.status(200).send({
        _id: doc._id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        fileUrl: doc.fileUrl,
        createdAt: doc.createdAt,
        uploadedBy: doc.uploadedBy
          ? `${doc.uploadedBy.firstname} ${doc.uploadedBy.lastname}`
          : "Unknown",
      });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  getDocuments: async (req, res, next) => {
    try {
      const result = await req.queryHandler(
        Document,
        { path: "uploadedBy", select: "firstname lastname" },
        ["title", "description", "category"] // search fields
      );

      const mapped = result.data.map((doc) => ({
        _id: doc._id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        fileUrl: doc.fileUrl,
        createdAt: doc.createdAt,
        uploadedBy: doc.uploadedBy
          ? `${doc.uploadedBy.firstname} ${doc.uploadedBy.lastname}`
          : "Unknown",
      }));

      res.send({
        data: mapped,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteDocument: async (req, res) => {
    try {
      const doc = await Document.findById(req.params.id);
      if (!doc) throw new Error("Document not found");

      await deleteFromCloudinary(doc.cloudinaryId);
      await doc.deleteOne();

      res.status(204).send();
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  updateDocument: async (req, res) => {
    try {
      const doc = await Document.findById(req.params.id);
      if (!doc) throw new Error("Document not found");

      doc.title = req.body.title || doc.title;
      doc.description = req.body.description || doc.description;

      const updated = await doc.save();
      res.status(200).send(updated);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },
};
