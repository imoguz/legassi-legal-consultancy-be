"use strict";

const { createAuditLog } = require("../helpers/audit.helper");
const generateMatterNumber = require("../helpers/generateMatterNumber");
const Matter = require("../models/matter.model");
const { notifyUsers } = require("../helpers/notification.helper");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const FinancialService = require("../services/financial.service");
const { uploadToCloudinaryBuffer } = require("../helpers/cloudinary");
const Document = require("../models/document.model");
const mongoose = require("mongoose");

module.exports = {
  create: async (req, res, next) => {
    try {
      const {
        title,
        client,
        primaryAttorney,
        practiceArea,
        description,
        team = [],
        status,
        stage,
        priority,
        court,
        opposingParties = [],
        dates,
        billing,
        confidentiality,
        permittedUsers = [],
      } = req.body;

      const currentUser = await User.findById(req.user.id).select(
        "firstname lastname email"
      );
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const finalMatterNumber = await generateMatterNumber();
      const finalPrimaryAttorney =
        (req.user.role === "admin" || req.user.role === "manager") &&
        primaryAttorney
          ? primaryAttorney
          : req.user.id;

      const newMatter = await Matter.create({
        title,
        client,
        primaryAttorney: finalPrimaryAttorney,
        practiceArea,
        description,
        matterNumber: finalMatterNumber,
        status: status || "open",
        stage: stage || "intake",
        priority: priority || "medium",
        court,
        opposingParties,
        dates: {
          openingDate: dates?.openingDate || new Date(),
          deadline: dates?.deadline,
          closedDate: dates?.closedDate,
          nextHearing: dates?.nextHearing,
          appealDeadline: dates?.appealDeadline,
        },
        billing: billing || { billingModel: "hourly", currency: "USD" },
        team,
        confidentiality: confidentiality || "private",
        permittedUsers,
        createdBy: req.user.id,
      });

      // Audit log
      await createAuditLog({
        collectionName: "matters",
        documentId: newMatter._id,
        changedBy: req.user.id,
        changedFields: Object.keys(req.body),
        operation: "create",
        previousValues: {},
        newValues: newMatter.toObject(),
      });

      // Notification
      const recipients = [
        newMatter.primaryAttorney,
        ...newMatter.team.map((tm) => tm.user),
      ].filter(
        (recipient, index, self) =>
          self.findIndex((r) => r.toString() === recipient.toString()) === index
      );

      await notifyUsers({
        recipients,
        title: "New Matter Created",
        message: `${currentUser.firstname} ${currentUser.lastname} created a new matter: ${newMatter.title}`,
        type: "matter",
        relatedId: newMatter._id,
        createdBy: req.user.id,
        metadata: {
          actionable: true,
        },
      });

      res.status(201).json(newMatter);
    } catch (err) {
      next(err);
    }
  },

  readMany: async (req, res, next) => {
    try {
      let baseFilters;

      if (req.user.role === "admin" || req.user.role === "manager") {
        baseFilters = { isDeleted: false };
      } else if (req.user.role === "staff") {
        baseFilters = {
          isDeleted: false,
          $or: [
            { primaryAttorney: req.user.id },
            { "team.user": req.user.id },
            { permittedUsers: req.user.id },
          ],
        };
      } else {
        baseFilters = { _id: null };
      }

      const matters = await req.queryHandler(
        Matter,
        [
          { path: "client" },
          {
            path: "primaryAttorney",
            select: "_id firstname lastname email role position profileUrl",
          },
          {
            path: "team.user",
            select: "_id firstname lastname email role position profileUrl",
          },
          {
            path: "invoices",
            select: "invoiceNumber status totalAmount balanceDue",
          },
          {
            path: "notes.author",
            select: "_id firstname lastname email role position profileUrl",
          },
          {
            path: "notes.attachments",
            // select: "_id firstname lastname email role position profileUrl",
          },
        ],
        ["title", "practiceArea", "matterNumber", "description"],
        baseFilters
      );

      res.status(200).json(matters);
    } catch (err) {
      next(err);
    }
  },

  readOne: async (req, res, next) => {
    try {
      const matter = await Matter.findOne({
        _id: req.params.id,
        isDeleted: false,
      })
        .populate("client")
        .populate({
          path: "primaryAttorney",
          select: "_id firstname lastname email position profileUrl",
        })
        .populate({
          path: "team.user",
          select: "_id firstname lastname email position profileUrl",
        })
        .populate({
          path: "notes.author",
          select: "_id firstname lastname email role position profileUrl",
        })
        .populate(
          "invoices",
          "invoiceNumber status issueDate dueDate totalAmount balanceDue"
        )
        .populate("payments", "paymentDate amount paymentMethod reference")
        .populate("notes.attachments");

      if (!matter) return res.status(404).send("Matter not found.");

      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        matter.primaryAttorney._id.toString() === req.user.id ||
        matter.team.some(
          (tm) => tm.user && tm.user._id.toString() === req.user.id
        ) ||
        matter.permittedUsers.some(
          (userId) => userId.toString() === req.user.id
        );

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to view this matter.");

      res.status(200).json(matter);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const matter = await Matter.findById(req.params.id);

      if (!matter) return res.status(404).send("Matter not found.");

      const currentUser = await User.findById(req.user.id).select(
        "firstname lastname email"
      );
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        matter.primaryAttorney.toString() === req.user.id;

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to update this matter.");

      const changedFields = Object.keys(req.body).filter(
        (key) => JSON.stringify(matter[key]) !== JSON.stringify(req.body[key])
      );

      const previousValues = {};
      const newValues = {};
      changedFields.forEach((field) => {
        previousValues[field] = matter[field];
        newValues[field] = req.body[field];
      });

      if (changedFields.length === 0) {
        return res
          .status(200)
          .json({ message: "No valid changes provided for update." });
      }

      Object.assign(matter, req.body);
      matter.modifiedBy = req.user.id;
      await matter.save();

      // Audit log
      await createAuditLog({
        collectionName: "matters",
        documentId: matter._id,
        changedBy: req.user.id,
        changedFields,
        operation: "update",
        previousValues,
        newValues,
      });

      // Notification
      const recipients = [
        matter.primaryAttorney,
        ...matter.team.map((tm) => tm.user),
      ].filter(
        (recipient, index, self) =>
          self.findIndex((r) => r.toString() === recipient.toString()) === index
      );

      await notifyUsers({
        recipients,
        title: "Matter Updated",
        message: `${currentUser.firstname} ${currentUser.lastname} updated the matter: ${matter.title}`,
        type: "matter",
        relatedId: matter._id,
        createdBy: req.user.id,
        metadata: {
          actionable: true,
        },
      });

      res.status(200).json(matter);
    } catch (err) {
      next(err);
    }
  },

  _delete: async (req, res, next) => {
    try {
      const matter = await Matter.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

      if (!matter) return res.status(404).send("Matter not found.");

      const currentUser = await User.findById(req.user.id).select(
        "firstname lastname email"
      );
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        (req.user.role === "staff" &&
          matter.primaryAttorney.toString() === req.user.id);

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to delete this matter.");

      const previousValues = { isDeleted: matter.isDeleted };
      matter.isDeleted = true;
      matter.modifiedBy = req.user.id;
      await matter.save();

      // Update all notifications related this matter
      await Notification.updateMany(
        {
          relatedId: matter._id,
          type: "matter",
          "metadata.actionable": { $ne: false },
        },
        {
          $set: {
            "metadata.actionable": false,
            "metadata.operation": "matter_deleted",
            "metadata.deletedAt": new Date(),
            "metadata.deletedBy": req.user.id,
          },
        }
      );

      // Audit log
      await createAuditLog({
        collectionName: "matters",
        documentId: matter._id,
        changedBy: req.user.id,
        changedFields: ["isDeleted"],
        operation: "delete",
        previousValues,
        newValues: { isDeleted: true },
      });

      // Notification
      const recipients = [
        matter.primaryAttorney,
        ...matter.team.map((tm) => tm.user),
      ].filter(
        (recipient, index, self) =>
          self.findIndex((r) => r.toString() === recipient.toString()) === index
      );

      await notifyUsers({
        recipients,
        title: "Matter Deleted",
        message: `${currentUser.firstname} ${currentUser.lastname} deleted the matter: ${matter.title}`,
        type: "matter",
        relatedId: matter._id,
        createdBy: req.user.id,
        metadata: {
          actionable: false,
          originalTitle: matter.title,
          operation: "delete",
        },
      });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  purge: async (req, res, next) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).send("Only admins can purge matters.");
      }

      const matter = await Matter.findById(req.params.id);
      if (!matter) return res.status(404).send("Matter not found.");

      const currentUser = await User.findById(req.user.id).select(
        "firstname lastname email"
      );
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update all notifications related this matter
      await Notification.updateMany(
        {
          relatedId: matter._id,
          type: "matter",
        },
        {
          $set: {
            "metadata.actionable": false,
            "metadata.operation": "matter_purged",
            "metadata.purgedAt": new Date(),
            "metadata.purgedBy": req.user.id,
          },
        }
      );

      // Audit log
      await createAuditLog({
        collectionName: "matters",
        documentId: matter._id,
        changedBy: req.user.id,
        changedFields: [],
        operation: "purge",
        previousValues: matter.toObject(),
        newValues: {},
      });

      await Matter.deleteOne({ _id: req.params.id });

      // Notification (only admin)
      const recipients = [
        matter.primaryAttorney,
        ...matter.team.map((tm) => tm.user),
      ].filter(
        (recipient, index, self) =>
          self.findIndex((r) => r.toString() === recipient.toString()) === index
      );

      await notifyUsers({
        recipients,
        title: "Matter Purged",
        message: `${currentUser.firstname} ${currentUser.lastname} permanently deleted the matter: ${matter.title}`,
        type: "matter",
        relatedId: matter._id,
        createdBy: req.user.id,
        metadata: {
          actionable: false,
          originalTitle: matter.title,
          operation: "purge",
        },
      });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  // Yeni finansal metodlar
  getFinancialSummary: async (req, res, next) => {
    try {
      const summary = await FinancialService.getMatterFinancialSummary(
        req.params.id
      );
      res.status(200).json(summary);
    } catch (err) {
      next(err);
    }
  },

  updateFinancials: async (req, res, next) => {
    try {
      const matter = await Matter.findById(req.params.id);
      if (!matter) {
        return res.status(404).send("Matter not found.");
      }

      await matter.updateFinancials();

      res.status(200).json({
        message: "Financials updated successfully",
        financials: matter.financials,
      });
    } catch (err) {
      next(err);
    }
  },

  addNote: async (req, res, next) => {
    const session = await Matter.startSession();
    session.startTransaction();

    try {
      const { matterId } = req.params;
      const { contentHtml, visibility, pinned } = req.body;
      const files = req.files || [];

      const matter = await Matter.findById(matterId).session(session);
      if (!matter) {
        await session.abortTransaction();
        return res.status(404).send("Matter not found.");
      }

      // Authorization check
      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        matter.primaryAttorney.toString() === req.user.id;

      if (!isAuthorized) {
        await session.abortTransaction();
        return res
          .status(403)
          .send("You are not authorized to add notes to this matter.");
      }

      // 1. Dosyaları Cloudinary'e yükle ve document kaydı oluştur
      const documentIds = [];
      for (const file of files) {
        try {
          const uploadResult = await uploadToCloudinaryBuffer(
            file.buffer,
            file.originalname
          );

          const document = await Document.create(
            [
              {
                filename: file.originalname,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                uploadedBy: req.user.id,
                matter: matterId,
              },
            ],
            { session }
          );

          documentIds.push(document[0]._id);
        } catch (fileError) {
          console.error("File upload error:", fileError);
          // Bir dosya hatası diğerlerini engellemesin
          continue;
        }
      }

      // 2. Note'u oluştur
      const newNote = {
        author: req.user.id,
        contentHtml,
        visibility: visibility || "internal",
        pinned: pinned || false,
        attachments: documentIds, // Oluşturulan document ID'leri
      };

      matter.notes.push(newNote);
      await matter.save({ session });

      // Populate the newly added note
      await matter.populate(
        "notes.author",
        "firstname lastname email profileUrl"
      );
      await matter.populate("notes.attachments");

      const createdNote = matter.notes[matter.notes.length - 1];

      // Audit log
      await createAuditLog({
        collectionName: "matters",
        documentId: matter._id,
        changedBy: req.user.id,
        changedFields: ["notes"],
        operation: "add_note",
        previousValues: {},
        newValues: { note: createdNote },
      });

      // Notification
      const currentUser = await User.findById(req.user.id).select(
        "firstname lastname email"
      );
      const recipients = [
        matter.primaryAttorney,
        ...matter.team.map((tm) => tm.user),
      ].filter(
        (recipient, index, self) =>
          self.findIndex((r) => r.toString() === recipient.toString()) === index
      );

      await notifyUsers({
        recipients,
        title: "New Note Added",
        message: `${currentUser.firstname} ${currentUser.lastname} added a note to matter: ${matter.title}`,
        type: "matter",
        relatedId: matter._id,
        createdBy: req.user.id,
        metadata: {
          actionable: true,
          noteId: createdNote._id,
        },
      });

      await session.commitTransaction();
      res.status(201).json(createdNote);
    } catch (err) {
      await session.abortTransaction();
      next(err);
    } finally {
      session.endSession();
    }
  },

  // matter.controller.js - updateNote fonksiyonu (transaction'sız versiyon)
  updateNote: async (req, res, next) => {
    try {
      const { matterId, noteId } = req.params;
      const { contentHtml, visibility, pinned, deletedAttachments } = req.body;
      const files = req.files || [];

      console.log("=== UPDATE NOTE DEBUG ===");
      console.log("matterId:", matterId);
      console.log("noteId:", noteId);
      console.log("deletedAttachments from body:", deletedAttachments);
      console.log("files count:", files.length);

      // deletedAttachments'ı güvenli şekilde işle
      let deletedAttachmentIds = [];
      if (deletedAttachments && deletedAttachments !== "[]") {
        if (Array.isArray(deletedAttachments)) {
          deletedAttachmentIds = deletedAttachments.filter(
            (id) =>
              id &&
              id !== "undefined" &&
              id !== "null" &&
              typeof id === "string" &&
              mongoose.Types.ObjectId.isValid(id)
          );
        } else if (
          typeof deletedAttachments === "string" &&
          deletedAttachments !== "undefined" &&
          mongoose.Types.ObjectId.isValid(deletedAttachments)
        ) {
          deletedAttachmentIds = [deletedAttachments];
        }
      }

      console.log("Processed deletedAttachmentIds:", deletedAttachmentIds);

      const matter = await Matter.findById(matterId);
      if (!matter) {
        return res.status(404).send("Matter not found.");
      }

      const note = matter.notes.id(noteId);
      if (!note) {
        return res.status(404).send("Note not found.");
      }

      console.log("Current note attachments:", note.attachments);

      // Authorization check
      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        note.author.toString() === req.user.id;

      if (!isAuthorized) {
        return res
          .status(403)
          .send("You are not authorized to edit this note.");
      }

      const previousValues = {
        contentHtml: note.contentHtml,
        visibility: note.visibility,
        pinned: note.pinned,
        attachments: [...note.attachments],
      };

      // 1. ÖNCE note'dan attachments'ı kaldır
      if (deletedAttachmentIds.length > 0) {
        console.log("Removing attachments from note:", deletedAttachmentIds);

        // Note'dan attachment'ları kaldır
        note.attachments = note.attachments.filter(
          (attachmentId) =>
            !deletedAttachmentIds.includes(attachmentId.toString())
        );

        console.log("Note attachments after removal:", note.attachments);
      }

      // 2. Yeni dosyaları Cloudinary'e yükle ve document kaydı oluştur
      const newDocumentIds = [];
      for (const file of files) {
        try {
          const uploadResult = await uploadToCloudinaryBuffer(
            file.buffer,
            file.originalname
          );

          const document = await Document.create({
            filename: file.originalname,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            uploadedBy: req.user.id,
            matter: matterId,
          });

          newDocumentIds.push(document._id);
          console.log(
            "Uploaded new file:",
            file.originalname,
            "ID:",
            document._id
          );
        } catch (fileError) {
          console.error("File upload error:", fileError);
          continue;
        }
      }

      // 3. Yeni document ID'lerini note'a ekle
      if (newDocumentIds.length > 0) {
        note.attachments.push(...newDocumentIds);
        console.log("Added new attachments:", newDocumentIds);
      }

      // 4. Diğer note alanlarını güncelle
      if (contentHtml !== undefined) note.contentHtml = contentHtml;
      if (visibility !== undefined) note.visibility = visibility;
      if (pinned !== undefined) note.pinned = pinned;

      note.modifiedBy = req.user.id;
      note.updatedAt = new Date();

      console.log("Saving matter with updated note...");

      // Matter'ı kaydet
      await matter.save();

      // 5. SONRA silinen document'leri veritabanından kaldır
      if (deletedAttachmentIds.length > 0) {
        const deleteResult = await Document.deleteMany({
          _id: { $in: deletedAttachmentIds },
        });
        console.log("Documents deleted from DB:", deleteResult);
      }

      // Populate the updated note
      await matter.populate(
        "notes.author",
        "firstname lastname email profileUrl"
      );
      await matter.populate(
        "notes.modifiedBy",
        "firstname lastname email profileUrl"
      );
      await matter.populate("notes.attachments");

      const updatedNote = matter.notes.id(noteId);
      console.log("Final note attachments:", updatedNote.attachments);

      // Audit log
      await createAuditLog({
        collectionName: "matters",
        documentId: matter._id,
        changedBy: req.user.id,
        changedFields: ["notes"],
        operation: "update_note",
        previousValues: { note: previousValues },
        newValues: { note: updatedNote },
      });

      console.log("=== UPDATE NOTE COMPLETED SUCCESSFULLY ===");
      res.status(200).json(updatedNote);
    } catch (err) {
      console.error("Update note error:", err);
      next(err);
    }
  },
  deleteNote: async (req, res, next) => {
    try {
      const { matterId, noteId } = req.params;

      const matter = await Matter.findById(matterId);
      if (!matter) {
        return res.status(404).send("Matter not found.");
      }

      const note = matter.notes.id(noteId);
      if (!note) {
        return res.status(404).send("Note not found.");
      }

      // Authorization check - only author, admin, or manager can delete
      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        note.author.toString() === req.user.id;

      if (!isAuthorized) {
        return res
          .status(403)
          .send("You are not authorized to delete this note.");
      }

      const deletedNote = note.toObject();

      // Remove the note
      matter.notes.pull(noteId);
      await matter.save();

      // Audit log
      await createAuditLog({
        collectionName: "matters",
        documentId: matter._id,
        changedBy: req.user.id,
        changedFields: ["notes"],
        operation: "delete_note",
        previousValues: { note: deletedNote },
        newValues: {},
      });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
