"use strict";

const AiSession = require("../models/aiSession.model");

const createSession = async (req, res, next) => {
  try {
    const session = await AiSession.create({
      user: req.user.id,
      title: req.body.title || "New Chat",
      // conversationId: AI servisinden gelecek, şimdilik boş
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

const getSession = async (req, res, next) => {
  try {
    const session = await AiSession.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

const getAllSessions = async (req, res, next) => {
  try {
    const sessions = await AiSession.find({
      user: req.user.id,
    }).sort({
      lastInteractionAt: -1,
    });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

const updateSession = async (req, res, next) => {
  try {
    const updated = await AiSession.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Session not found or not yours.",
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteSession = async (req, res, next) => {
  try {
    const deleted = await AiSession.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Session not found or not yours.",
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSession,
  getSession,
  getAllSessions,
  updateSession,
  deleteSession,
};
