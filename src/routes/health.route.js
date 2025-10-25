"use strict";

const router = require("express").Router();
const healthController = require("../controllers/health.controller");

router.get("/ai", healthController.checkAIHealth);

module.exports = router;
