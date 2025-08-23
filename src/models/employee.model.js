"use strict";

const { Schema, model } = require("mongoose");
const validator = require("validator");
const { hashPassword } = require("../helpers/passwordEncrypt");

const salarySchema = new Schema(
  {
    amount: { type: Number, min: 0 },
    currency: {
      type: String,
      default: "USD",
    },
    paySchedule: {
      type: String,
      enum: ["MONTHLY", "BI_WEEKLY", "WEEKLY", "ANNUAL"],
      default: "MONTHLY",
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
      set: (v) => Math.round(v * 100) / 100,
    },
    bonusDescription: { type: String, trim: true },
    benefits: [{ type: String, trim: true }],
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    apartment: { type: String, trim: true },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const barAdmissionSchema = new Schema(
  {
    jurisdiction: { type: String, trim: true },
    barNumber: { type: String, trim: true },
    admissionDate: { type: Date },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "RETIRED"],
      default: "ACTIVE",
    },
  },
  { _id: false }
);

/* --- Main Schema --- */
const employeeSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: { validator: validator.isEmail, message: "Invalid email." },
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: { type: Date },
    nationalId: { type: String, trim: true, select: false },

    address: addressSchema,

    department: {
      type: String,
      required: true,
      enum: [
        "CORPORATE",
        "LITIGATION",
        "FAMILY",
        "REAL_ESTATE",
        "IP",
        "TAX",
        "FINANCE",
        "ADMIN",
        "HR",
        "IT",
        "COMPLIANCE",
      ],
      required: true,
    },
    position: {
      type: String,
      enum: [
        "PARTNER",
        "SENIOR_ASSOCIATE",
        "ASSOCIATE",
        "PARALEGAL",
        "ASSISTANT",
        "INTERN",
        "STAFF",
        "OTHER",
      ],
      required: true,
    },
    practiceAreas: [
      {
        type: String,
        enum: [
          "M&A",
          "GOVERNANCE",
          "LITIGATION",
          "ARBITRATION",
          "DIVORCE",
          "PATENT",
          "TRADEMARK",
          "TAX",
          "BANKING",
          "DATA_PRIVACY",
          "COMPLIANCE",
        ],
      },
    ],
    barAdmissions: [barAdmissionSchema],

    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"],
      default: "FULL_TIME",
    },
    employmentStatus: {
      type: String,
      enum: ["ACTIVE", "ON_LEAVE", "TERMINATED", "RETIRED"],
      default: "ACTIVE",
    },

    hireDate: { type: Date, default: Date.now },
    terminationDate: { type: Date },

    salary: salarySchema,

    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
    },

    profileImage: {
      id: { type: String, trim: true },
      url: { type: String, trim: true },
    },
    tags: [{ type: String, trim: true }],
    notes: { type: String, trim: true },

    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "Employee" },
  },
  {
    timestamps: true,
    collection: "employees",
  }
);

// Hooks
employeeSchema.pre("save", async function (next) {
  if (this.isModified("nationalId") && this.nationalId) {
    this.nationalId = await hashPassword(this.nationalId);
  }
});

employeeSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (!update) return next();
  if (update.nationalId) {
    update.nationalId = await hashPassword(update.nationalId);
  }
  next();
});

module.exports = model("Employee", employeeSchema);
