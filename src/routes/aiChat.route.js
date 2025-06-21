"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");

const {
  createChatMessage,
  getChatMessages,
} = require("../controllers/aiChat.controller");

router.use(jwtVerification, requireAuth());

router.post("/:sessionId/messages", createChatMessage);

router.get("/:sessionId/messages", getChatMessages);

module.exports = router;
