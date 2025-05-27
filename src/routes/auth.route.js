"use strict";

const router = require("express").Router();

const {
  login,
  logout,
  refreshToken,
} = require("../controllers/auth.controller");

router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/logout", logout);

module.exports = router;
