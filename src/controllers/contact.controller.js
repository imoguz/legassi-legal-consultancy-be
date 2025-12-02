"use strict";

const Contact = require("../models/contact.model");
const { createAuditLog } = require("../helpers/audit.helper");

module.exports = {
  create: async (req, res) => {
    const body = {
      ...req.body,
      createdBy: req.user.id,
    };

    const data = await Contact.create(body);

    // Audit log
    await createAuditLog({
      collectionName: "contacts",
      documentId: data._id,
      changedBy: req.user.id,
      changedFields: ["fullName", "email", "phone", "companyName", "createdBy"],
      operation: "create",
      previousValues: {},
      newValues: data.toObject(),
    });

    res.status(201).send(data);
  },

  readOne: async (req, res) => {
    const data = await Contact.findById(req.params.id);

    if (!data) return res.status(404).send({ message: "Contact not found" });

    res.status(200).send(data);
  },

  readMany: async (req, res, next) => {
    try {
      const baseFilters =
        req.user.role === "admin"
          ? { isDeleted: false }
          : { createdBy: req.user.id, isDeleted: false };

      const data = await req.queryHandler(
        Contact,
        null,
        ["fullName", "email", "phone", "companyName"], // searchable fields
        baseFilters
      );

      res.send(data);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).send({ message: "Contact not found" });

    const changedFields = Object.keys(req.body).filter(
      (key) => contact[key] !== req.body[key]
    );
    const previousValues = {};
    const newValues = {};

    changedFields.forEach((field) => {
      previousValues[field] = contact[field];
      newValues[field] = req.body[field];
    });

    if (changedFields.length === 0) {
      return res
        .status(200)
        .json({ message: "No valid changes provided for update." });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Audit log
    await createAuditLog({
      collectionName: "contacts",
      documentId: updatedContact._id,
      changedBy: req.user.id,
      changedFields,
      operation: "update",
      previousValues,
      newValues,
    });

    res.status(202).send(updatedContact);
  },

  _delete: async (req, res, next) => {
    try {
      const contact = await Contact.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

      if (!contact) return res.status(404).send("Contact not found.");

      const isAuthorized =
        req.user.role === "admin" ||
        contact.createdBy.toString() === req.user.id;

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to delete this contact.");

      const previousValues = { isDeleted: contact.isDeleted };
      contact.isDeleted = true;
      await contact.save();

      // Audit log
      await createAuditLog({
        collectionName: "contacts",
        documentId: contact._id,
        changedBy: req.user.id,
        changedFields: ["isDeleted"],
        operation: "delete",
        previousValues,
        newValues: { isDeleted: true },
      });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  purge: async (req, res, next) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).send("Only admins can purge contacts.");
      }

      const contact = await Contact.findById(req.params.id);
      if (!contact) return res.status(404).send("Contact not found.");

      // Audit log
      await createAuditLog({
        collectionName: "contacts",
        documentId: contact._id,
        changedBy: req.user.id,
        changedFields: [],
        operation: "purge",
        previousValues: contact.toObject(),
        newValues: {},
      });

      await Contact.deleteOne({ _id: req.params.id });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
