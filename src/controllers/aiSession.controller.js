"use strict";

const AiSession = require("../models/aiSession.model");

const createSession = async (req, res, next) => {
  try {
    const session = await AiSession.create({
      user: req.user.id,
      title: req.body.title || "New Chat",
    });

    res.status(201).json(session);
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
      return res.status(404).json({ message: "Session not found." });
    }

    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
};

const getAllSessions = async (req, res, next) => {
  try {
    const baseFilter = req.user.role === "admin" ? {} : { user: req.user.id };

    const sessions = await req.queryHandler(
      AiSession,
      null,
      ["title"], // searchable fields
      baseFilter
    );

    res.json(sessions);
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
      return res
        .status(404)
        .json({ message: "Session not found or not yours." });
    }

    res.status(202).json(updated);
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
      return res
        .status(404)
        .send({ message: "Session not found or not yours." });
    }

    // delete all chat messages of the session
    await AiChat.deleteMany({ session: req.params.id });

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
