"use strict";

const { Schema, model } = require("mongoose");
const validator = require("validator");
const { hashPassword, comparePassword } = require("../helpers/passwordEncrypt");

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email address.",
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    profileUrl: {
      type: String,
      trim: true,
      default: null,
    },

    role: {
      type: String,
      enum: ["owner", "admin", "staff", "assistant", "client"],
      default: "client",
    },

    position: {
      type: String,
      enum: [
        "lawyer",
        "paralegal",
        "intern",
        "accountant",
        "assistant",
        "manager",
        null,
      ],
      default: null,
      validate: {
        validator: function (value) {
          if (this.role === "client" && value !== null) return false;
          return true;
        },
        message: "Clients cannot have a position",
      },
    },

    notificationPreferences: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: false,
      },
      push: {
        type: Boolean,
        default: false,
      },

      types: {
        task: { type: Boolean, default: true },
        calendar: { type: Boolean, default: true },
        matter: { type: Boolean, default: true },
        document: { type: Boolean, default: true },
        system: { type: Boolean, default: true },
        reminder: { type: Boolean, default: true },
      },

      priorities: {
        low: { type: Boolean, default: true },
        medium: { type: Boolean, default: true },
        high: { type: Boolean, default: true },
        urgent: { type: Boolean, default: true },
      },
    },

    lastEmailNotificationAt: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

// Hashing the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~\-])[A-Za-z\d!@#$%^&*()_+[\]{};':"\\|,.<>/?`~\-]{8,32}$/;

  if (!passwordRegex.test(this.password)) {
    throw new Error(
      "Password: 8-32 chars, mix of uppercase, lowercase, numbers & special chars."
    );
  }

  this.password = await hashPassword(this.password);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (plainPassword) {
  return await comparePassword(plainPassword, this.password);
};

userSchema.methods.canReceiveNotification = function (type, priority) {
  if (!this.notificationPreferences.inApp) return false;

  // Ttype check
  if (this.notificationPreferences.types[type] === false) return false;

  // Priority check
  if (this.notificationPreferences.priorities[priority] === false) return false;

  return true;
};

userSchema.methods.canReceiveEmail = function () {
  return this.notificationPreferences.email && this.isVerified;
};

module.exports = model("User", userSchema);
