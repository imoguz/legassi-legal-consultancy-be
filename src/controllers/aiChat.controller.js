"use strict";

const generateSessionTitle = require("../helpers/generateSessionTitle");
const AiChat = require("../models/aiChat.model");
const AiSession = require("../models/aiSession.model");
const aiChatService = require("../services/aiChat.service");

class AIChatController {
  async createChatMessage(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { prompt } = req.body;

      if (!prompt?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Prompt is required.",
        });
      }

      if (prompt.length > 4000) {
        return res.status(400).json({
          success: false,
          message: "Prompt too long. Maximum 4000 characters allowed.",
        });
      }

      const session = await AiSession.findOne({
        _id: sessionId,
        user: req.user.id,
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session not found or unauthorized.",
        });
      }

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Cache-Control");

      res.write(
        "data: " + JSON.stringify({ type: "connected", sessionId }) + "\n\n"
      );

      let fullResponse = "";
      let newConversationId = session.conversationId;

      const onData = (chunk) => {
        res.write(chunk);
      };

      const onEnd = async (response, conversationId, error) => {
        if (error) {
          const errorMessage = this._handleAIError(error);
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              message: errorMessage,
            })}\n\n`
          );
          res.end();
          return;
        }

        fullResponse = response;
        newConversationId = conversationId;

        try {
          await this._saveChatMessage(
            req.user.id,
            sessionId,
            prompt,
            fullResponse
          );
          await this._updateSession(
            session,
            newConversationId,
            fullResponse,
            prompt
          );

          res.write(
            `data: ${JSON.stringify({
              type: "complete",
              conversationId: newConversationId,
            })}\n\n`
          );
        } catch (dbError) {
          console.error("Database save error:", dbError.message);
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              message: "Failed to save conversation",
            })}\n\n`
          );
        } finally {
          res.end();
        }
      };

      await aiChatService.sendPrompt(
        prompt.trim(),
        session.conversationId,
        onData,
        onEnd.bind(this)
      );
    } catch (error) {
      console.error("Create chat message error:", error.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      } else {
        res.end();
      }
    }
  }

  async getChatMessages(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const session = await AiSession.findOne({
        _id: sessionId,
        user: req.user.id,
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session not found or unauthorized.",
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const messages = await AiChat.find({ session: sessionId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await AiChat.countDocuments({ session: sessionId });

      res.status(200).json({
        success: true,
        data: {
          messages,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Private methods
  async _saveChatMessage(userId, sessionId, prompt, response) {
    const formattedResponse =
      typeof response === "string" ? response : JSON.stringify(response);

    return await AiChat.create({
      user: userId,
      session: sessionId,
      prompt,
      response: formattedResponse,
    });
  }

  async _updateSession(session, conversationId, response, prompt) {
    session.lastInteractionAt = new Date();

    if (conversationId && session.conversationId !== conversationId) {
      session.conversationId = conversationId;
    }

    if (session.title === "New Chat") {
      session.title = generateSessionTitle(response, prompt) || "New Chat";
    }

    await session.save();
  }

  _handleAIError(error) {
    if (error.code === "ECONNREFUSED") {
      return "AI service is currently unavailable. Please try again later.";
    } else if (error.response?.status === 429) {
      return "Rate limit exceeded. Please wait a moment before trying again.";
    } else if (error.response?.status >= 500) {
      return "AI service is experiencing issues. Please try again later.";
    } else {
      return "An unexpected error occurred. Please try again.";
    }
  }
}

module.exports = new AIChatController();
