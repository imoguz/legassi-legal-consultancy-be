"use strict";

const Document = require("../models/document.model");
const {
  uploadToCloudinaryBuffer,
  deleteFromCloudinary,
} = require("../helpers/cloudinary");
const { createAuditLog } = require("../helpers/audit.helper");

module.exports = {
  create: async (req, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");

      const result = await uploadToCloudinaryBuffer(
        req.file.buffer,
        req.file.originalname
      );

      const doc = await Document.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        fileUrl: result.secure_url,
        fileSize: req.body.fileSize,
        fileType: req.body.fileType,
        cloudinaryId: result.public_id,
        documentType: req.body.documentType || "public",
        uploadedBy: req.user.id,
        matterId: req.body.matterId || null,
      });

      // Audit log
      await createAuditLog({
        collectionName: "documents",
        documentId: doc._id,
        changedBy: req.user.id,
        changedFields: [
          "title",
          "description",
          "category",
          "fileUrl",
          "fileSize",
          "fileType",
          "documentType",
          "uploadedBy",
          "matterId",
        ],
        operation: "create",
        previousValues: {},
        newValues: doc.toObject(),
      });

      res.status(201).send(doc);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  readOne: async (req, res) => {
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
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        createdAt: doc.createdAt,
        uploadedBy: doc.uploadedBy
          ? `${doc.uploadedBy.firstname} ${doc.uploadedBy.lastname}`
          : "Unknown",
      });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  readMany: async (req, res, next) => {
    try {
      const baseFilters = { documentType: "public" };

      const result = await req.queryHandler(
        Document,
        { path: "uploadedBy", select: "firstname lastname" },
        ["title", "description", "category"], // search fields
        baseFilters
      );

      const mapped = result.data.map((doc) => ({
        _id: doc._id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        documentType: doc.documentType,
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

  update: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) return res.status(404).send("Document not found.");

      const changedFields = Object.keys(req.body).filter(
        (key) => JSON.stringify(document[key]) !== JSON.stringify(req.body[key])
      );

      const previousValues = {};
      const newValues = {};

      changedFields.forEach((field) => {
        previousValues[field] = document[field];
        newValues[field] = req.body[field];
      });

      if (changedFields.length === 0) {
        return res
          .status(200)
          .json({ message: "No valid changes provided for update." });
      }

      Object.assign(document, req.body);
      await document.save();

      // Audit log
      await createAuditLog({
        collectionName: "documents",
        documentId: document._id,
        changedBy: req.user.id,
        changedFields,
        operation: "update",
        previousValues,
        newValues,
      });

      res.status(200).send(doc);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  _delete: async (req, res) => {
    try {
      const document = await Document.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

      if (!document) return res.status(404).send("Document not found.");

      const previousValues = { isDeleted: document.isDeleted };
      document.isDeleted = true;
      await document.save();

      // Audit log
      await createAuditLog({
        collectionName: "documents",
        documentId: document._id,
        changedBy: req.user.id,
        changedFields: ["isDeleted"],
        operation: "delete",
        previousValues,
        newValues: { isDeleted: true },
      });

      res.status(204).send();
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  purge: async (req, res, next) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).send("Document not found.");

      // Audit log
      await createAuditLog({
        collectionName: "documents",
        documentId: document._id,
        changedBy: req.user.id,
        changedFields: [],
        operation: "purge",
        previousValues: document.toObject(),
        newValues: {},
      });

      await deleteFromCloudinary(document.cloudinaryId);

      await Document.deleteOne({ _id: req.params.id });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
