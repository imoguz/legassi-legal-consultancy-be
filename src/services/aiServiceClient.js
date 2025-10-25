"use strict";

const axios = require("axios");

class AIServiceClient {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || "http://43.100.46.13:50893";
    this.apiKey = process.env.AI_SERVICE_API_KEY || "backend-dev-key-12345";
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 60000,
      headers: {
        "X-API-KEY": this.apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  async healthCheck() {
    try {
      const response = await this.client.get("/api/v1/health");
      return { healthy: true, data: response.data };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  async sendPromptStream(promptData, onData, onEnd) {
    const {
      text,
      mode = "general",
      document_ids = [],
      conversation_id = null,
    } = promptData;

    try {
      const response = await this.client({
        method: "post",
        url: "/api/v1/ask/stream",
        data: {
          text,
          mode,
          document_ids,
          conversation_id,
        },
        responseType: "stream",
      });

      let buffer = "";
      let fullResponse = "";
      let returnedConversationId = conversation_id;

      response.data.on("data", (chunk) => {
        const textChunk = chunk.toString();
        buffer += textChunk;

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        lines.forEach((line) => {
          if (line.trim() === "") return;

          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.conversation_id) {
                returnedConversationId = data.conversation_id;
              }

              if (data.content) {
                fullResponse += data.content;
              }

              onData(line + "\n");
            } catch (parseError) {
              onData(
                `data: ${JSON.stringify({
                  raw: line,
                  error: "parse_error",
                })}\n\n`
              );
            }
          }
        });
      });

      response.data.on("end", () => {
        onEnd(fullResponse, returnedConversationId, null);
      });

      response.data.on("error", (error) => {
        onEnd(fullResponse, returnedConversationId, error);
      });
    } catch (error) {
      onEnd("", conversation_id, error);
    }
  }

  async startScraping(scrapingConfig) {
    try {
      const response = await this.client.post(
        "/api/v1/scraping/start",
        scrapingConfig
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async stopScraping() {
    try {
      const response = await this.client.post("/api/v1/scraping/stop");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async getScrapingStatus() {
    try {
      const response = await this.client.get("/api/v1/scraping/status");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

module.exports = new AIServiceClient();
