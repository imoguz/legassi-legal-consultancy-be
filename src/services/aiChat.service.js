"use strict";

const aiServiceClient = require("./aiServiceClient");

class AIChatService {
  async sendPrompt(prompt, conversationId, onData, onEnd) {
    const promptData = {
      text: prompt,
      mode: "general",
      document_ids: [],
      conversation_id: conversationId || null,
    };

    await aiServiceClient.sendPromptStream(promptData, onData, onEnd);
  }

  async validateAIService() {
    return await aiServiceClient.healthCheck();
  }
}

module.exports = new AIChatService();
