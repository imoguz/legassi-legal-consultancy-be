"use strict";

const legalAssistantService = require("../services/legalAssistant.service");
const mongoose = require("mongoose");

const checkAIHealth = async (req, res) => {
  try {
    const health = await legalAssistantService.validateAIService();

    res.json({
      success: true,
      aiService: {
        healthy: health.healthy,
        status: health.healthy ? "connected" : "disconnected",
      },
      database: {
        connected: mongoose.connection.readyState === 1,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      aiService: {
        healthy: false,
        error: error.message,
      },
    });
  }
};

module.exports = {
  checkAIHealth,
};
