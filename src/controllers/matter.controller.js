"use strict";

const { createAuditLog } = require("../helpers/audit.helper");
const generateMatterNumber = require("../helpers/generateMatterNumber");
const Matter = require("../models/matter.model");
const { notifyUsers } = require("../helpers/notification.helper");
const User = require("../models/user.model");

module.exports = {
  create: async (req, res, next) => {
    try {
      const {
        title,
        client,
        matterType,
        description,
        tags,
        teamMembers = [],
        status,
        feeType,
        importantDates,
        court,
        opposingParty,
        assignedAttorney,
      } = req.body;

      const currentUser = await User.findById(req.user.id).select(
        "firstname lastname email"
      );
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const finalMatterNumber = await generateMatterNumber();
      const finalAssignedAttorney =
        req.user.role === "admin" && assignedAttorney
          ? assignedAttorney
          : req.user.id;

      const newMatter = await Matter.create({
        title,
        client,
        assignedAttorney: finalAssignedAttorney,
        matterType,
        description,
        matterNumber: finalMatterNumber,
        status,
        court,
        opposingParty,
        feeType,
        teamMembers,
        tags,
        importantDates: {
          openingDate: importantDates?.openingDate || new Date(),
          deadline: importantDates?.deadline,
        },
        createdBy: req.user.id,
      });

      // Audit log
      await createAuditLog({
        collectionName: "matters",
        documentId: newMatter._id,
        changedBy: req.user.id,
        changedFields: [
          "title",
          "client",
          "assignedAttorney",
          "matterType",
          "description",
          "status",
          "court",
          "opposingParty",
          "feeType",
          "teamMembers",
          "tags",
          "importantDates",
        ],
        operation: "create",
        previousValues: {},
        newValues: newMatter.toObject(),
      });

      // Notification
      const recipients = [
        newMatter.assignedAttorney,
        ...newMatter.teamMembers.map((tm) => tm.member),
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
            { assignedAttorney: req.user.id },
            { "teamMembers.member": req.user.id },
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
            path: "assignedAttorney",
            select: "_id firstname lastname email role position profileUrl",
          },
          {
            path: "relatedDocuments",
          },
          {
            path: "teamMembers.member",
            select: "_id firstname lastname email role position profileUrl",
          },
        ], // populate fields
        ["title", "tags", "matterType", "status"], // searchable fields
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
          path: "assignedAttorney",
          select: "_id firstname lastname email position profileUrl",
        })
        .populate("relatedDocuments")
        .populate({
          path: "teamMembers.member",
          select: "_id firstname lastname email position profileUrl",
        });

      if (!matter) return res.status(404).send("Matter not found.");

      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        matter.assignedAttorney._id.toString() === req.user.id ||
        matter.teamMembers.some(
          (tm) => tm.member && tm.member._id.toString() === req.user.id
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
        matter.assignedAttorney.toString() === req.user.id;

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
        matter.assignedAttorney,
        ...matter.teamMembers.map((tm) => tm.member),
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
          matter.assignedAttorney.toString() === req.user.id);

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to delete this matter.");

      const previousValues = { isDeleted: matter.isDeleted };
      matter.isDeleted = true;
      await matter.save();

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
        matter.assignedAttorney,
        ...matter.teamMembers.map((tm) => tm.member),
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
        matter.assignedAttorney,
        ...matter.teamMembers.map((tm) => tm.member),
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
};
