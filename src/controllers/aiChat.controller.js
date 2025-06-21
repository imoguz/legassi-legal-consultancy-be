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

    // send promp to AI service
    const aiResponse = await sendPromptToAIService(prompt);

    const chat = await AiChat.create({
      user: req.user.id,
      session: sessionId,
      prompt,
      response: aiResponse,
    });

    // update session interaction date
    session.lastInteractionAt = new Date();

    // Generate new title if it is default
    if (session.title === "New Chat") {
      const aiText =
        typeof aiResponse === "string" ? aiResponse : aiResponse.text;
      const newTitle = generateSessionTitle(aiText);
      session.title = newTitle;
    }

    await session.save();

    const data = {
      prompt,
      response: aiResponse,
      session: {
        _id: session._id,
        title: session.title,
        lastInteractionAt: session.lastInteractionAt,
      },
    };
    res.status(201).json(data);
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
