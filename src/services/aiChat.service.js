"use strict";

const axios = require("axios");

async function sendPromptToAIService(prompt, conversationId, onData, onEnd) {
  const response = await axios({
    method: "post",
    url: "http://localhost:8000/api/v1/ask/stream",
    data: {
      text: prompt,
      mode: "general",
      document_ids: [],
      conversation_id: conversationId || null,
    },
    responseType: "stream",
    headers: {
      "X-API-KEY": process.env.AI_SERVICE_KEY || "backend-dev-key-101",
    },
  });

  let buffer = "";
  let returnedConversationId = conversationId;

  response.data.on("data", (chunk) => {
    const text = chunk.toString();
    buffer += text;

    try {
      const parsed = JSON.parse(text.replace(/^data:\s*/, ""));
      if (parsed.conversation_id) {
        returnedConversationId = parsed.conversation_id;
      }
    } catch (e) {
      // ignore
    }

    onData(text);
  });

  response.data.on("end", () => {
    onEnd(buffer, returnedConversationId);
  });

  response.data.on("error", (err) => {
    console.error("Stream error:", err.message);
    onEnd(buffer, returnedConversationId, err);
  });
}

module.exports = { sendPromptToAIService };
