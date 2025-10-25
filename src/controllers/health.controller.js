"use strict";

const aiChatService = require("../services/aiChat.service");
const mongoose = require("mongoose");

class HealthController {
  async checkAIHealth(req, res) {
    try {
      const health = await aiChatService.validateAIService();

      res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        aiService: {
          healthy: health.healthy,
          url: process.env.AI_SERVICE_URL,
        },
        database: {
          connected: mongoose.connection.readyState === 1,
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: "Service unhealthy",
        aiService: {
          healthy: false,
          error: error.message,
        },
      });
    }
  }
}

module.exports = new HealthController();
