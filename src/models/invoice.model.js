"use strict";

const { Schema, model, Types } = require("mongoose");

// Money rounding helper
const roundMoney = (value) => Math.round(value * 100) / 100;

const InvoiceSchema = new Schema(
  {
    matter: {
      type: Types.ObjectId,
      ref: "Matter",
      required: true,
      index: true,
    },
    invoiceNumber: { type: String, required: true, unique: true },
    client: {
      type: Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true,
    },

    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date },
    currency: { type: String, default: "USD" },

    status: {
      type: String,
      enum: ["draft", "issued", "paid", "overdue", "void"],
      default: "draft",
      index: true,
    },

    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true, set: roundMoney },
        total: { type: Number, required: true, set: roundMoney },
        type: {
          type: String,
          enum: ["time", "expense", "other"],
          default: "other",
        },
        linkedTimeEntry: { type: Types.ObjectId, ref: "TimeEntry" },
        linkedExpense: { type: Types.ObjectId, ref: "Expense" },
      },
    ],

    subtotal: { type: Number, required: true, set: roundMoney },
    taxAmount: { type: Number, default: 0, set: roundMoney },
    totalAmount: { type: Number, required: true, set: roundMoney },

    amountPaid: { type: Number, default: 0, set: roundMoney },
    balanceDue: { type: Number, default: 0, set: roundMoney },

    notes: { type: String, trim: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    modifiedBy: { type: Types.ObjectId, ref: "User" },
    attachments: [{ type: Types.ObjectId, ref: "Document" }],
  },
  { timestamps: true }
);

/* ----- Validations ----- */

// 1) Line item total validation
InvoiceSchema.pre("validate", function () {
  for (const item of this.lineItems) {
    item.total = roundMoney(item.quantity * item.unitPrice);
  }
});

// 2) Auto-calc subtotal + totalAmount + balanceDue
InvoiceSchema.pre("validate", function () {
  this.subtotal = roundMoney(
    this.lineItems.reduce((sum, i) => sum + i.total, 0)
  );
  this.totalAmount = roundMoney(this.subtotal + (this.taxAmount || 0));
  this.balanceDue = roundMoney(this.totalAmount - (this.amountPaid || 0));
});

// 3) Auto-status-update
InvoiceSchema.pre("save", function () {
  if (this.balanceDue <= 0 && this.totalAmount > 0) {
    this.status = "paid";
  } else if (this.dueDate && this.dueDate < new Date() && this.balanceDue > 0) {
    this.status = "overdue";
  }
});

/* ----- Indexes ----- */
InvoiceSchema.index({ client: 1, status: 1, issueDate: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ dueDate: 1, status: 1 });

module.exports = model("Invoice", InvoiceSchema);
