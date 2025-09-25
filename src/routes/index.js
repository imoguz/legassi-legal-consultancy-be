"use strict";

const router = require("express").Router();
const { authLimiter } = require("../middlewares/rateLimiter");

router.use("/auth", authLimiter, require("./auth.route"));
router.use("/users", require("./user.route"));
router.use("/documents", require("./document.route"));
router.use("/ai-document-search", require("./aiDocumentSearch.route"));
router.use("/ai-chat", require("./aiChat.route"));
router.use("/ai-session", require("./aiSession.route"));
router.use("/matters", require("./matter.route"));
router.use("/contacts", require("./contact.route"));
router.use("/employees", require("./employee.route"));
router.use("/tasks", require("./task.route"));
router.use("/reports", require("./reports.route"));
router.use("/calendar-events", require("./calendarEvent.route"));

module.exports = router;
