"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const {
  searchDocuments,
  getUserSearchHistory,
  deleteUserSearchRecord,
} = require("../controllers/aiDocumentSearch.controller");

router.use(jwtVerification, requireAuth());

router.post("/query", searchDocuments);

router.get("/history", getUserSearchHistory);

router.delete("/history/:id", deleteUserSearchRecord);

module.exports = router;
