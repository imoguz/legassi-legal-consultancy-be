"use strict";

const router = require("express").Router();

const {
  login,
  logout,
  refreshToken,
} = require("../controllers/auth.controller");

router.route("/login").post(login);
router.route("/refresh-token").post(refreshToken);
router.route("/logout").get(logout);

module.exports = router;
