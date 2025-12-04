"use strict";

const router = require("express").Router();
const {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  me,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/login", login);

router.post("/refresh-token", refreshToken);

router.post("/logout", logout);

router.get("/me", authMiddleware, me);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

module.exports = router;
