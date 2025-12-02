"use strict";

const router = require("express").Router();
const requireAuth = require("../middlewares/requireAuth");
const legalAssistantController = require("../controllers/legalAssistant.controller");

router.use(requireAuth);

// Chat endpoint
router.post("/chat", legalAssistantController.chat);

// Session management
router.get(
  "/sessions/:conversationId",
  legalAssistantController.getConversationHistory
);
router.get("/sessions", legalAssistantController.getSessions);
router.put("/sessions/:conversationId", legalAssistantController.updateSession);
router.delete(
  "/sessions/:conversationId",
  legalAssistantController.deleteSession
);
router.patch(
  "/sessions/:conversationId/archive",
  legalAssistantController.archiveSession
);

module.exports = router;
