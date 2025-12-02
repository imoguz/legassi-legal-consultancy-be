"use strict";

const legalAssistantClient = require("./legalAssistantClient");

const sendPromptStream = async (options) => {
  const promptData = {
    text: options.prompt,
    mode: "general",
    document_ids: [],
    conversation_id: options.conversationId,
    allowed_states: [],
  };

  return legalAssistantClient.sendPromptStream(
    promptData,
    options.onData,
    options.onEnd
  );
};

const exportConversations = (conversationIds) => {
  return legalAssistantClient.exportConversations(conversationIds);
};

const validateAIService = () => {
  return legalAssistantClient.healthCheck();
};

module.exports = {
  sendPromptStream,
  exportConversations,
  validateAIService,
};
