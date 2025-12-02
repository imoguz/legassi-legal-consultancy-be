// routes/filters.routes.js
"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const { getTaskFilters } = require("../controllers/filters.controller");

// JWT Verification for all routes
router.use(jwtVerification);

// Task filtreleri
router.get("/tasks", requirePermission("LIST_TASKS"), getTaskFilters);

module.exports = router;
