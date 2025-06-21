"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");

const {
  createSession,
  getSession,
  getAllSessions,
  updateSession,
  deleteSession,
} = require("../controllers/aiSession.controller");

router.use(jwtVerification, requireAuth());

router.route("/").post(createSession).get(getAllSessions);

router.route("/:id").get(getSession).put(updateSession).delete(deleteSession);

module.exports = router;
