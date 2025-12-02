"use strict";

const Payment = require("../models/payment.model");
const FinancialService = require("../services/financial.service");
const { createAuditLog } = require("../helpers/audit.helper");

const paymentController = {
  create: async (req, res, next) => {
    try {
      const payment = await FinancialService.createPayment(req.body, req.user);

      // Audit log
      await createAuditLog({
        collectionName: "payments",
        documentId: payment._id,
        changedBy: req.user.id,
        changedFields: Object.keys(req.body),
        operation: "create",
        previousValues: {},
        newValues: payment.toObject(),
      });

      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  },

  readMany: async (req, res, next) => {
    try {
      const baseFilters = {};

      const payments = await req.queryHandler(
        Payment,
        [
          { path: "matter", select: "title matterNumber" },
          { path: "invoice", select: "invoiceNumber totalAmount" },
          { path: "client", select: "name email" },
          { path: "createdBy", select: "firstname lastname" },
        ],
        ["reference", "notes"],
        baseFilters
      );

      res.status(200).json(payments);
    } catch (err) {
      next(err);
    }
  },

  readOne: async (req, res, next) => {
    try {
      const payment = await Payment.findById(req.params.id)
        .populate("matter", "title matterNumber")
        .populate("invoice", "invoiceNumber totalAmount")
        .populate("client", "name email")
        .populate("createdBy", "firstname lastname");

      if (!payment) return res.status(404).send("Payment not found.");

      res.status(200).json(payment);
    } catch (err) {
      next(err);
    }
  },

  readByMatter: async (req, res, next) => {
    try {
      const payments = await Payment.find({ matter: req.params.matterId })
        .populate("invoice", "invoiceNumber")
        .populate("createdBy", "firstname lastname")
        .sort({ paymentDate: -1 });

      res.status(200).json(payments);
    } catch (err) {
      next(err);
    }
  },

  readByInvoice: async (req, res, next) => {
    try {
      const payments = await Payment.find({ invoice: req.params.invoiceId })
        .populate("matter", "title matterNumber")
        .populate("createdBy", "firstname lastname")
        .sort({ paymentDate: -1 });

      res.status(200).json(payments);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const payment = await FinancialService.deletePayment(
        req.params.id,
        req.user
      );

      // Audit log
      await createAuditLog({
        collectionName: "payments",
        documentId: payment._id,
        changedBy: req.user.id,
        changedFields: [],
        operation: "delete",
        previousValues: payment.toObject(),
        newValues: {},
      });

      res.status(200).json({ message: "Payment deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = paymentController;
