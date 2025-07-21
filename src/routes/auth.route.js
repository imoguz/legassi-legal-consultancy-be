"use strict";

const router = require("express").Router();

const {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
