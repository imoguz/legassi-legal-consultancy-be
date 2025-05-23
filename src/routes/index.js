"use strict";

const router = require("express").Router();
const { authLimiter } = require("../middlewares/rateLimiter");

router.use("/auth", authLimiter, require("./auth.route"));
router.use("/users", require("./user.route"));

module.exports = router;
