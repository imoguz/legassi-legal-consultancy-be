"use strict";

const axios = require("axios");

const AI_SERVICE_CONFIG = {
  baseURL: process.env.AI_SERVICE_URL || "http://136.114.125.188:8000",
  apiKey: process.env.AI_SERVICE_API_KEY || "backend-dev-key-12345",
  timeout: 30000,
};

const aiClient = axios.create({
  baseURL: AI_SERVICE_CONFIG.baseURL,
  timeout: AI_SERVICE_CONFIG.timeout,
  headers: {
    "X-API-KEY": AI_SERVICE_CONFIG.apiKey,
  },
});

// Health check
const healthCheck = async () => {
  try {
    const response = await aiClient.get("/api/v1/health");
    return {
      healthy: true,
      data: response.data,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
    };
  }
};

// Send prompt stream
const sendPromptStream = async (promptData, onData, onEnd) => {
  try {
    const response = await aiClient({
      method: "post",
      url: "/api/v1/ask/stream",
      data: promptData,
      responseType: "stream",
      timeout: 120000,
    });

    let buffer = "";

    response.data.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      lines.forEach((line) => {
        if (line.startsWith("data: ") && line.trim()) {
          try {
            const data = JSON.parse(line.slice(6));
            onData(data);
          } catch (error) {
            console.error("Parse error:", error);
          }
        }
      });
    });

    response.data.on("end", () => {
      onEnd(null);
    });

    response.data.on("error", (error) => {
      onEnd(error);
    });
  } catch (error) {
    onEnd(error);
  }
};

// Export conversations
const exportConversations = async (conversationIds) => {
  try {
    const response = await aiClient.post("/api/v1/conversations/export", {
      conversation_ids: conversationIds,
    });

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

module.exports = {
  healthCheck,
  sendPromptStream,
  exportConversations,
};
