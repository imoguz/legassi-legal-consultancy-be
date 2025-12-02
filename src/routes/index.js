"use strict";

const router = require("express").Router();
const { authLimiter } = require("../middlewares/rateLimiter");

router.use("/health", require("./health.route"));
router.use("/auth", authLimiter, require("./auth.route"));
router.use("/users", require("./user.route"));
router.use("/filters", require("./filters.route"));
router.use("/documents", require("./docLibrary.route"));
router.use("/legal-assistant", require("./legalAssistant.route"));
router.use("/ai-document-search", require("./aiDocumentSearch.route"));
router.use("/matters", require("./matter.route"));
router.use("/contacts", require("./contact.route"));
router.use("/employees", require("./employee.route"));
router.use("/tasks", require("./task.route"));
router.use("/reports", require("./reports.route"));
router.use("/calendar-events", require("./calendarEvent.route"));
router.use("/notifications", require("./notification.route"));
router.use("/payments", require("./payment.route"));
router.use("/invoices", require("./invoice.route"));

module.exports = router;
