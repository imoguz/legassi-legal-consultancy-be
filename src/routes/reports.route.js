"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const {
  getMatterReport,
  getTaskReport,
  getDocumentReport,
  getUserReport,
} = require("../controllers/report.controller");

// JWT Verification for all routes
router.use(jwtVerification);

router.get("/matters", requirePermission("VIEW_REPORTS"), getMatterReport);
router.get("/tasks", requirePermission("VIEW_REPORTS"), getTaskReport);
router.get("/documents", requirePermission("VIEW_REPORTS"), getDocumentReport);
router.get("/users", requirePermission("VIEW_REPORTS"), getUserReport);

module.exports = router;
