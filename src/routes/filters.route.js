"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const {
  getTaskFilters,
  getMatterFilters,
} = require("../controllers/filters.controller");

// JWT Verification for all routes
router.use(jwtVerification);

// Task filters
router.get("/tasks", requirePermission("LIST_TASKS"), getTaskFilters);

// Matter filters
router.get("/matters", requirePermission("LIST_MATTERS"), getMatterFilters);

module.exports = router;
