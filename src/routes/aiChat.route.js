"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const aiChatController = require("../controllers/aiChat.controller");

// Apply authentication middleware
router.use(jwtVerification, requireAuth());

router.post(
  "/:sessionId/messages",
  aiChatController.createChatMessage.bind(aiChatController)
);
router.get(
  "/:sessionId/messages",
  aiChatController.getChatMessages.bind(aiChatController)
);

module.exports = router;
