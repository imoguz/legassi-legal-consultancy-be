"use strict";

const User = require("../models/user.model");
const { sendEmail, verificationTemplate } = require("../helpers/sendEmail");
const generateVerificationToken = require("../helpers/generateVerificationToken");
const jwt = require("jsonwebtoken");

module.exports = {
  create: async (req, res) => {
    const allowedRoles = ["user", "lawyer"];

    if (req.user?.role !== "admin") {
      req.body.role = allowedRoles.includes(req.body.role)
        ? req.body.role
        : "user";
    }

    const data = await User.create(req.body);

    const token = generateVerificationToken(data);

    await sendEmail({
      from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_ADDRESS}>`,
      to: data.email,
      subject: "Account Verification",
      html: verificationTemplate(data, token),
    });

    res.status(201).send(data);
  },

  verify: async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).send("Token missing");

    try {
      const decoded = jwt.verify(token, process.env.VERIFY_KEY);
      console.log("decoded", decoded);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      if (user.isVerified) {
        return res
          .status(200)
          .send({ message: "Account is already verified." });
      }

      user.isVerified = true;
      await user.save();

      // Redirect to login page after verification
      res
        .status(302)
        .redirect(`${process.env.CLIENT_URL}/auth/verified-success`);
    } catch (err) {
      console.error(err);
      return res.redirect(`${process.env.CLIENT_URL}/auth/verification-error`);
    }
  },

  readOne: async (req, res) => {
    if (req.params.id !== req.user?._id && req.user?.role !== "admin") {
      return res
        .status(401)
        .send("You are not authorized to view other users' information.");
    }

    const data = await User.findById(req.params.id);
    res.status(200).send(data);
  },

  readMany: async (req, res) => {
    const filter = req.user?.role === "admin" ? {} : { _id: req.user?._id };
    const data = await req.queryHandler(User, "", filter);
    res.status(200).send(data);
  },

  update: async (req, res) => {
    if (req.params.id !== req.user?._id && req.user?.role !== "admin") {
      return res
        .status(401)
        .send("You are not authorized to update other users' information.");
    }

    if (req.user?.role !== "admin") {
      delete req.body.role;
    }

    const data = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(202).send(data);
  },

  _delete: async (req, res) => {
    if (req.params.id !== req.user?._id && req.user?.role !== "admin") {
      return res
        .status(401)
        .send("You are not authorized to delete other users.");
    }

    const data = await User.findByIdAndDelete(req.params.id);
    res.status(data ? 204 : 404).send();
  },
};
