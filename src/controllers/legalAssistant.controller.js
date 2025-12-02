"use strict";

const LegalAssistantSession = require("../models/legalAssistantSession.model");
const legalAssistantService = require("../services/legalAssistant.service");

const chat = async (req, res) => {
  const { prompt, conversation_id } = req.body;
  const userId = req.user.id;

  if (!prompt?.trim()) {
    return res.status(400).json({ success: false, message: "Prompt required" });
  }

  // Session kontrol
  if (conversation_id) {
    const session = await LegalAssistantSession.findOne({
      conversationId: conversation_id,
      user: userId,
    });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
  }

  // SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  let newConversationId = conversation_id;
  let conversationTitle = "New Chat";

  try {
    await legalAssistantService.sendPromptStream({
      prompt: prompt.trim(),
      conversationId: conversation_id,
      onData: (data) => {
        // AI'dan geleni direkt forward et
        res.write(`data: ${JSON.stringify(data)}\n\n`);

        if (data.conversation_id) newConversationId = data.conversation_id;
        if (data.title) conversationTitle = data.title;
      },
      onEnd: async (error) => {
        if (error) {
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              message: "AI error",
            })}\n\n`
          );
        } else {
          // Session kaydet
          if (!conversation_id && newConversationId) {
            await LegalAssistantSession.create({
              user: userId,
              title: conversationTitle,
              conversationId: newConversationId,
              lastInteractionAt: new Date(),
            });
          }

          res.write(
            `data: ${JSON.stringify({
              type: "complete",
              conversationId: newConversationId,
              title: conversationTitle,
            })}\n\n`
          );
        }
        res.end();
      },
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error" });
    } else {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: "Server error",
        })}\n\n`
      );
      res.end();
    }
  }
};

const getConversationHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const session = await LegalAssistantSession.findOne({
      conversationId: conversationId,
      user: userId,
    });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    const result = await legalAssistantService.exportConversations([
      conversationId,
    ]);

    if (!result.success) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch history" });
    }

    const conversationData = result.data.results.find(
      (item) => item.conversation_id === conversationId
    );

    if (!conversationData) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    res.json({
      success: true,
      data: {
        messages: conversationData.messages || [],
        conversationId: conversationData.conversation_id,
        title: conversationData.title || session.title,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, archived = false } = req.query;

    const sessions = await LegalAssistantSession.find({
      user: userId,
      isArchived: archived === "true",
    })
      .sort({ lastInteractionAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await LegalAssistantSession.countDocuments({
      user: userId,
      isArchived: archived === "true",
    });

    res.json({
      success: true,
      data: {
        sessions,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateSession = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    if (!title?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title required" });
    }

    const session = await LegalAssistantSession.findOneAndUpdate(
      { conversationId: conversationId, user: userId },
      { title: title.trim() },
      { new: true }
    );

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const session = await LegalAssistantSession.findOneAndDelete({
      conversationId: conversationId,
      user: userId,
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const archiveSession = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const session = await LegalAssistantSession.findOneAndUpdate(
      { conversationId: conversationId, user: userId },
      { isArchived: true },
      { new: true }
    );

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  chat,
  getConversationHistory,
  getSessions,
  updateSession,
  deleteSession,
  archiveSession,
};
