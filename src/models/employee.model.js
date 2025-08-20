"use strict";

const { Schema, model } = require("mongoose");
const validator = require("validator");
const { hashPassword } = require("../helpers/passwordEncrypt");

// Salary Subschema
const salarySchema = new Schema(
  {
    baseAmount: { type: Number, required: true },
    currency: { type: String, default: "USD", trim: true },
    netAmount: { type: Number },
    paySchedule: {
      type: String,
      enum: ["monthly", "weekly", "yearly"],
      default: "monthly",
    },
    bonus: { type: Number, default: 0 },
    benefits: [{ type: String, trim: true }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const employeeSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    nationalId: {
      type: String,
      trim: true,
      select: false,
    },

    emails: [
      {
        address: {
          type: String,
          trim: true,
          lowercase: true,
          validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email address.",
          },
        },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    phoneNumbers: [
      {
        label: {
          type: String,
          enum: ["mobile", "office", "home", "emergency", "fax", "other"],
          trim: true,
        },
        number: { type: String, trim: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },

    department: {
      type: String,
      enum: [
        "corporate-law",
        "litigation",
        "ip",
        "family-law",
        "real-estate",
        "tax",
        "finance",
        "hr",
        "it",
        "admin",
        "business-dev",
        "compliance",
      ],
      default: "litigation",
      trim: true,
    },

    position: {
      type: String,
      enum: [
        "juniorLawyer",
        "seniorLawyer",
        "paralegal",
        "accountant",
        "hrManager",
        "itSpecialist",
        "adminStaff",
        "intern",
        "contractor",
        "other",
      ],
      trim: true,
      default: "juniorLawyer",
    },

    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "intern", "contract", "consultant"],
      default: "full-time",
    },

    status: {
      type: String,
      enum: ["active", "on-leave", "terminated", "resigned", "retired"],
      default: "active",
    },

    systemRole: {
      type: String,
      enum: [
        "admin",
        "lawyer",
        "assistant",
        "finance",
        "staff",
        "hr",
        "complianceOfficer",
      ],
      default: "staff",
    },

    hireDate: {
      type: Date,
      default: Date.now,
    },
    terminationDate: {
      type: Date,
    },

    salary: salarySchema,

    profileImage: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "employees",
  }
);

// Enforce single primary
function enforceSinglePrimary(list) {
  if (!Array.isArray(list) || list.length === 0) return list;
  let primaryFound = false;
  return list.map((item) => {
    if (item.isPrimary && !primaryFound) {
      primaryFound = true;
      return item;
    }
    return { ...item, isPrimary: false };
  });
}

// Hooks
employeeSchema.pre("save", async function (next) {
  if (this.isModified("nationalId") && this.nationalId) {
    this.nationalId = await hashPassword(this.nationalId);
  }
  this.emails = enforceSinglePrimary(this.emails);
  this.phoneNumbers = enforceSinglePrimary(this.phoneNumbers);
  next();
});

// Run validators for findOneAndUpdate
employeeSchema.pre("findOneAndUpdate", async function (next) {
  this.setOptions({ runValidators: true, context: "query" });

  const update = this.getUpdate();
  if (!update) return next();

  if (update.emails) {
    update.emails = enforceSinglePrimary(update.emails);
  }
  if (update.phoneNumbers) {
    update.phoneNumbers = enforceSinglePrimary(update.phoneNumbers);
  }
  if (update.nationalId) {
    update.nationalId = await hashPassword(update.nationalId);
  }
  next();
});

module.exports = model("Employee", employeeSchema);
