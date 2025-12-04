"use strict";

const { Schema, model, Types } = require("mongoose");

// Money rounding
const roundMoney = (value) => Math.round(value * 100) / 100;

//  Sub Schemas
const TeamMemberSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: [
        "attorney",
        "partner",
        "paralegal",
        "assistant",
        "intern",
        "manager",
      ],
      default: "assistant",
    },
    assignedBy: { type: Types.ObjectId, ref: "User" },
    isPrimary: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OpposingPartySchema = new Schema(
  {
    name: { type: String, trim: true },
    type: {
      type: String,
      enum: ["individual", "company", "government", "other"],
      default: "individual",
    },
    representative: { type: String, trim: true },
    contactInfo: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      address: { type: String, trim: true },
    },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const ImportantDatesSchema = new Schema(
  {
    openingDate: { type: Date, default: Date.now },
    deadline: { type: Date },
    closedDate: { type: Date },
    nextHearing: { type: Date },
    appealDeadline: { type: Date },
  },
  { _id: false }
);

const BillingSettingsSchema = new Schema(
  {
    billingModel: {
      type: String,
      enum: ["hourly", "flat", "contingency", "mixed"],
      default: "hourly",
    },
    hourlyRate: Number,
    currency: { type: String, default: "USD" },
  },
  { _id: false }
);

const MatterNoteSchema = new Schema(
  {
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentHtml: {
      type: String,
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ["internal", "client", "team", "restricted"],
      default: "internal",
    },
    permittedUsers: [{ type: Types.ObjectId, ref: "User" }],

    modifiedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    attachments: [{ type: Types.ObjectId, ref: "Document" }],
  },
  { timestamps: true }
);

// Main Schema
const MatterSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    matterNumber: { type: String, unique: true, sparse: true, index: true },

    practiceArea: { type: String, index: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "on-hold", "closed"],
      default: "open",
      index: true,
    },
    stage: {
      type: String,
      enum: [
        "intake",
        "preparation",
        "filing",
        "discovery",
        "hearing",
        "trial",
        "appeal",
        "complete",
      ],
      default: "intake",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    client: { type: Types.ObjectId, ref: "Contact", required: true },
    primaryAttorney: { type: Types.ObjectId, ref: "User", required: true },
    team: [TeamMemberSchema],

    court: {
      name: String,
      location: String,
      caseNumber: String,
      judge: String,
    },
    opposingParties: [OpposingPartySchema],

    dates: ImportantDatesSchema,

    billing: BillingSettingsSchema,
    financials: {
      totalBilled: { type: Number, default: 0, set: roundMoney },
      totalPaid: { type: Number, default: 0, set: roundMoney },
      outstanding: { type: Number, default: 0, set: roundMoney },
      retainerBalance: { type: Number, default: 0, set: roundMoney },
    },

    documents: [{ type: Types.ObjectId, ref: "Document" }],
    tasks: [{ type: Types.ObjectId, ref: "Task" }],
    invoices: [{ type: Types.ObjectId, ref: "Invoice" }],
    timeEntries: [{ type: Types.ObjectId, ref: "TimeEntry" }],
    payments: [{ type: Types.ObjectId, ref: "Payment" }],

    notes: [MatterNoteSchema],

    visibility: {
      type: String,
      enum: ["internal", "team", "client", "restricted"],
      default: "internal",
    },

    permittedUsers: [{ type: Types.ObjectId, ref: "User" }],

    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    modifiedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes
MatterSchema.index({ "dates.deadline": 1 });
MatterSchema.index({ client: 1, status: 1 });
MatterSchema.index({ primaryAttorney: 1, status: 1 });

// Methods
MatterSchema.methods.updateFinancials = async function (session = null) {
  const Invoice = model("Invoice");
  const Payment = model("Payment");

  // Total invoice
  const invoices = await Invoice.find({ matter: this._id }).session(session);
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Total payments
  const payments = await Payment.find({ matter: this._id }).session(session);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  this.financials.totalBilled = roundMoney(totalBilled);
  this.financials.totalPaid = roundMoney(totalPaid);
  this.financials.outstanding = roundMoney(totalBilled - totalPaid);

  return this.save({ session });
};

MatterSchema.methods.addInvoice = async function (invoiceId, session = null) {
  if (!this.invoices.includes(invoiceId)) {
    this.invoices.push(invoiceId);
    await this.save({ session });
  }
};

MatterSchema.methods.addPayment = async function (paymentId, session = null) {
  if (!this.payments.includes(paymentId)) {
    this.payments.push(paymentId);
    await this.save({ session });
  }
};

MatterSchema.methods.removePayment = async function (
  paymentId,
  session = null
) {
  this.payments = this.payments.filter(
    (p) => p.toString() !== paymentId.toString()
  );
  await this.save({ session });
};

module.exports = model("Matter", MatterSchema);
