"use strict";

const router = require("express").Router();
const { authLimiter } = require("../middlewares/rateLimiter");

router.use("/auth", authLimiter, require("./auth.route"));
router.use("/users", require("./user.route"));
router.use("/ai-search", require("./ai-search.route"));
router.use("/documents", require("./document.route"));
router.use("/ai-chat", require("./aiChat.route"));
router.use("/ai-session", require("./aiSession.route"));

module.exports = router;
