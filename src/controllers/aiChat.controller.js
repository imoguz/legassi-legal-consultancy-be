"use strict";

const generateSessionTitle = require("../helpers/generateSessionTitle");
const AiChat = require("../models/aiChat.model");
const AiSession = require("../models/aiSession.model");
const { sendPromptToAIService } = require("../services/aiChat.service");

const createChatMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).send({ message: "Prompt is required." });
    }

    const session = await AiSession.findOne({
      _id: sessionId,
      user: req.user.id,
    });

    if (!session) {
      return res
        .status(404)
        .send({ message: "Session not found or unauthorized." });
    }

    // stream headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await sendPromptToAIService(
      prompt,
      session.conversationId,
      (chunk) => {
        res.write(chunk);
      },
      async (fullResponse, newConversationId, err) => {
        if (!err) {
          await AiChat.create({
            user: req.user.id,
            session: sessionId,
            prompt,
            response: fullResponse,
          });

          session.lastInteractionAt = new Date();

          if (
            newConversationId &&
            session.conversationId !== newConversationId
          ) {
            session.conversationId = newConversationId;
          }

          if (session.title === "New Chat") {
            session.title =
              generateSessionTitle(fullResponse, prompt) || "New Chat";
          }

          await session.save();
        }
        res.end();
      }
    );
  } catch (err) {
    next(err);
  }
};

const getChatMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await AiSession.findOne({
      _id: sessionId,
      user: req.user.id,
    });

    if (!session) {
      return res
        .status(404)
        .json({ message: "Session not found or unauthorized." });
    }

    const messages = await AiChat.find({ session: sessionId }).sort({
      createdAt: 1,
    });

    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createChatMessage,
  getChatMessages,
};
