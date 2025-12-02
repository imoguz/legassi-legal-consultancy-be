"use strict";

const { Schema, model, Types } = require("mongoose");

// Money rounding helper
const roundMoney = (value) => Math.round(value * 100) / 100;

const PaymentSchema = new Schema(
  {
    matter: {
      type: Types.ObjectId,
      ref: "Matter",
      required: true,
      index: true,
    },
    invoice: { type: Types.ObjectId, ref: "Invoice", required: false },

    client: { type: Types.ObjectId, ref: "Contact", required: true },

    paymentDate: { type: Date, required: true, default: Date.now },

    amount: { type: Number, required: true, set: roundMoney },
    currency: { type: String, default: "USD" },

    paymentMethod: {
      type: String,
      enum: [
        "credit_card",
        "bank_transfer",
        "cash",
        "check",
        "paypal",
        "other",
      ],
      default: "bank_transfer",
    },

    reference: { type: String },
    notes: { type: String, trim: true },

    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    modifiedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/* ----- Validations ----- */
PaymentSchema.pre("validate", function () {
  if (this.amount <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }
  this.amount = roundMoney(this.amount);
});

/* ----- Required Indexes ----- */
PaymentSchema.index({ client: 1, paymentDate: -1 });
PaymentSchema.index({ matter: 1, invoice: 1, paymentDate: -1 });

module.exports = model("Payment", PaymentSchema);
