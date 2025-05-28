"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const {
  search,
  getUserQueries,
} = require("../controllers/ai-search.controller");

router.post("/", jwtVerification, requireAuth(), search);

router.get("/user-queries", jwtVerification, requireAuth(), getUserQueries);

module.exports = router;
