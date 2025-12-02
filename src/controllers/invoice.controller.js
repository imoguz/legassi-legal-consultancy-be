"use strict";

const Invoice = require("../models/invoice.model");
const FinancialService = require("../services/financial.service");
const { createAuditLog } = require("../helpers/audit.helper");

const invoiceController = {
  create: async (req, res, next) => {
    try {
      const invoice = await FinancialService.createInvoice(req.body, req.user);

      await createAuditLog({
        collectionName: "invoices",
        documentId: invoice._id,
        changedBy: req.user.id,
        changedFields: Object.keys(req.body),
        operation: "create",
        previousValues: {},
        newValues: invoice.toObject(),
      });

      res.status(201).json(invoice);
    } catch (err) {
      next(err);
    }
  },

  readMany: async (req, res, next) => {
    try {
      const baseFilters = {};

      const invoices = await req.queryHandler(
        Invoice,
        [
          { path: "matter", select: "title matterNumber" },
          { path: "client", select: "name email" },
          { path: "createdBy", select: "firstname lastname" },
        ],
        ["invoiceNumber", "description"],
        baseFilters
      );

      res.status(200).json(invoices);
    } catch (err) {
      next(err);
    }
  },

  readOne: async (req, res, next) => {
    try {
      const invoice = await Invoice.findById(req.params.id)
        .populate("matter", "title matterNumber")
        .populate("client", "name email phone")
        .populate("createdBy", "firstname lastname")
        .populate("attachments");

      if (!invoice) return res.status(404).send("Invoice not found.");

      res.status(200).json(invoice);
    } catch (err) {
      next(err);
    }
  },

  readByMatter: async (req, res, next) => {
    try {
      const invoices = await Invoice.find({ matter: req.params.matterId })
        .populate("client", "name email")
        .populate("createdBy", "firstname lastname")
        .sort({ issueDate: -1 });

      res.status(200).json(invoices);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) return res.status(404).send("Invoice not found.");

      const previousValues = invoice.toObject();

      Object.assign(invoice, req.body);
      invoice.modifiedBy = req.user.id;
      await invoice.save();

      // Update matter financials
      const Matter = require("../models/matter.model");
      const matter = await Matter.findById(invoice.matter);
      if (matter) {
        await matter.updateFinancials();
      }

      const changedFields = Object.keys(req.body).filter(
        (key) =>
          JSON.stringify(previousValues[key]) !== JSON.stringify(req.body[key])
      );

      await createAuditLog({
        collectionName: "invoices",
        documentId: invoice._id,
        changedBy: req.user.id,
        changedFields,
        operation: "update",
        previousValues,
        newValues: invoice.toObject(),
      });

      res.status(200).json(invoice);
    } catch (err) {
      next(err);
    }
  },

  issue: async (req, res, next) => {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) return res.status(404).send("Invoice not found.");

      if (invoice.status !== "draft") {
        return res.status(400).send("Only draft invoices can be issued.");
      }

      const previousStatus = invoice.status;
      invoice.status = "issued";
      invoice.modifiedBy = req.user.id;
      await invoice.save();

      await createAuditLog({
        collectionName: "invoices",
        documentId: invoice._id,
        changedBy: req.user.id,
        changedFields: ["status"],
        operation: "update",
        previousValues: { status: previousStatus },
        newValues: { status: "issued" },
      });

      res.status(200).json(invoice);
    } catch (err) {
      next(err);
    }
  },

  void: async (req, res, next) => {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) return res.status(404).send("Invoice not found.");

      const previousStatus = invoice.status;
      invoice.status = "void";
      invoice.modifiedBy = req.user.id;
      await invoice.save();

      // Update matter financials
      const Matter = require("../models/matter.model");
      const matter = await Matter.findById(invoice.matter);
      if (matter) {
        await matter.updateFinancials();
      }

      await createAuditLog({
        collectionName: "invoices",
        documentId: invoice._id,
        changedBy: req.user.id,
        changedFields: ["status"],
        operation: "update",
        previousValues: { status: previousStatus },
        newValues: { status: "void" },
      });

      res.status(200).json(invoice);
    } catch (err) {
      next(err);
    }
  },

  recalculate: async (req, res, next) => {
    try {
      const result = await FinancialService.updateInvoiceStatus(
        req.params.id,
        req.user
      );

      await createAuditLog({
        collectionName: "invoices",
        documentId: result.invoice._id,
        changedBy: req.user.id,
        changedFields: result.statusChanged
          ? ["amountPaid", "balanceDue", "status"]
          : ["amountPaid", "balanceDue"],
        operation: "recalculate",
        previousValues: {},
        newValues: result.invoice.toObject(),
      });

      res.status(200).json({
        message: "Invoice recalculated successfully",
        invoice: result.invoice,
        statusChanged: result.statusChanged,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = invoiceController;
