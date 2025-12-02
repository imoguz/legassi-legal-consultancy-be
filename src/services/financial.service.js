"use strict";

const mongoose = require("mongoose");
const Matter = require("../models/matter.model");
const Invoice = require("../models/invoice.model");
const Payment = require("../models/payment.model");

// Money rounding helper
const roundMoney = (value) => Math.round(value * 100) / 100;

/**
 * Create payment with transaction
 */
async function createPayment(paymentData, user) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create payment
    const payment = new Payment({
      ...paymentData,
      createdBy: user.id,
      modifiedBy: user.id,
    });

    await payment.save({ session });

    // Add payment to matter
    const matter = await Matter.findById(paymentData.matter).session(session);
    if (matter) {
      await matter.addPayment(payment._id, session);
    }

    // Update invoice if provided
    if (paymentData.invoice) {
      const invoice = await Invoice.findById(paymentData.invoice).session(
        session
      );
      if (invoice) {
        invoice.amountPaid = roundMoney(
          invoice.amountPaid + paymentData.amount
        );
        invoice.balanceDue = roundMoney(
          invoice.totalAmount - invoice.amountPaid
        );

        // Update invoice status
        if (invoice.balanceDue <= 0) {
          invoice.status = "paid";
        } else if (invoice.dueDate && invoice.dueDate < new Date()) {
          invoice.status = "overdue";
        } else {
          invoice.status = "issued";
        }

        invoice.modifiedBy = user.id;
        await invoice.save({ session });
      }
    }

    // Update matter financials
    if (matter) {
      await matter.updateFinancials(session);
    }

    await session.commitTransaction();

    return payment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Create invoice with transaction
 */
async function createInvoice(invoiceData, user) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Currency consistency check
    const matter = await Matter.findById(invoiceData.matter).session(session);
    if (matter && matter.billing.currency !== invoiceData.currency) {
      throw new Error("Invoice currency must match matter billing currency");
    }

    // Auto-calculate line items totals
    if (invoiceData.lineItems && invoiceData.lineItems.length > 0) {
      invoiceData.lineItems.forEach((item) => {
        item.total = roundMoney(item.quantity * item.unitPrice);
      });

      // Calculate totals
      invoiceData.subtotal = roundMoney(
        invoiceData.lineItems.reduce((sum, item) => sum + item.total, 0)
      );
      invoiceData.totalAmount = roundMoney(
        invoiceData.subtotal + (invoiceData.taxAmount || 0)
      );
      invoiceData.balanceDue = invoiceData.totalAmount;
    }

    // Create invoice
    const invoice = new Invoice({
      ...invoiceData,
      createdBy: user.id,
      modifiedBy: user.id,
    });

    await invoice.save({ session });

    // Add invoice to matter
    if (matter) {
      await matter.addInvoice(invoice._id, session);
      await matter.updateFinancials(session);
    }

    await session.commitTransaction();

    return invoice;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Delete payment with transaction
 */
async function deletePayment(paymentId, user) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update invoice if exists
    if (payment.invoice) {
      const invoice = await Invoice.findById(payment.invoice).session(session);
      if (invoice) {
        invoice.amountPaid = roundMoney(invoice.amountPaid - payment.amount);
        invoice.balanceDue = roundMoney(
          invoice.totalAmount - invoice.amountPaid
        );

        // Update invoice status
        if (
          invoice.balanceDue > 0 &&
          invoice.dueDate &&
          invoice.dueDate < new Date()
        ) {
          invoice.status = "overdue";
        } else if (invoice.balanceDue > 0) {
          invoice.status = "issued";
        } else {
          invoice.status = "paid";
        }

        invoice.modifiedBy = user.id;
        await invoice.save({ session });
      }
    }

    // Update matter
    const matter = await Matter.findById(payment.matter).session(session);
    if (matter) {
      await matter.removePayment(paymentId, session);
      await matter.updateFinancials(session);
    }

    // Delete payment
    await Payment.findByIdAndDelete(paymentId).session(session);

    await session.commitTransaction();

    return payment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get matter financial summary
 */
async function getMatterFinancialSummary(matterId) {
  const matter = await Matter.findById(matterId);
  if (!matter) {
    throw new Error("Matter not found");
  }

  const invoices = await Invoice.find({ matter: matterId });
  const payments = await Payment.find({ matter: matterId });

  return {
    matter: matter.financials,
    invoices: {
      total: invoices.length,
      draft: invoices.filter((i) => i.status === "draft").length,
      issued: invoices.filter((i) => i.status === "issued").length,
      paid: invoices.filter((i) => i.status === "paid").length,
      overdue: invoices.filter((i) => i.status === "overdue").length,
      void: invoices.filter((i) => i.status === "void").length,
    },
    payments: {
      total: payments.length,
      totalAmount: roundMoney(payments.reduce((sum, p) => sum + p.amount, 0)),
    },
  };
}

/**
 * Update invoice status based on payments and due date
 */
async function updateInvoiceStatus(invoiceId, user) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const previousStatus = invoice.status;

    // Calculate actual balance due from payments
    const payments = await Payment.find({ invoice: invoiceId }).session(
      session
    );
    const totalPaid = roundMoney(
      payments.reduce((sum, p) => sum + p.amount, 0)
    );

    invoice.amountPaid = totalPaid;
    invoice.balanceDue = roundMoney(invoice.totalAmount - totalPaid);

    // Update status based on new calculations
    if (invoice.balanceDue <= 0 && invoice.totalAmount > 0) {
      invoice.status = "paid";
    } else if (
      invoice.dueDate &&
      invoice.dueDate < new Date() &&
      invoice.balanceDue > 0
    ) {
      invoice.status = "overdue";
    } else if (invoice.balanceDue > 0) {
      invoice.status = "issued";
    }

    invoice.modifiedBy = user.id;
    await invoice.save({ session });

    // Update matter financials
    const matter = await Matter.findById(invoice.matter).session(session);
    if (matter) {
      await matter.updateFinancials(session);
    }

    await session.commitTransaction();

    return {
      invoice,
      statusChanged: previousStatus !== invoice.status,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = {
  createPayment,
  createInvoice,
  deletePayment,
  getMatterFinancialSummary,
  updateInvoiceStatus,
};
