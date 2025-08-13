"use strict";

const mongoose = require("mongoose");
const AiDocumentSearch = require("../models/aiDocumentSearch.model");
const Document = require("../models/document.model");
const {
  sendPromptToDocumentAIService,
} = require("../services/aiDocumentSearch.service");

const searchDocuments = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res
        .status(400)
        .json({ message: "Prompt is required and must be a string." });
    }

    // Request AI service to fetch matching document IDs
    const matched = await sendPromptToDocumentAIService(prompt.trim());

    if (!Array.isArray(matched) || matched.length === 0) {
      return res.status(200).json({ prompt, results: [] });
    }

    // Collect only valid MongoDB ObjectIds
    const docIds = matched
      .map((m) => (mongoose.Types.ObjectId.isValid(m.id) ? m.id : null))
      .filter(Boolean);

    if (docIds.length === 0) {
      return res.status(200).json({ prompt, results: [] });
    }

    // Fetch matched documents securely
    const documents = await Document.find({ _id: { $in: docIds } }).lean();

    // Merge relevance scores with found documents
    const results = matched
      .map((m) => {
        const doc = documents.find((d) => d._id.toString() === m.id);
        if (!doc) return null;
        return {
          ...doc,
          relevanceScore: typeof m.weight === "number" ? m.weight : 0,
        };
      })
      .filter(Boolean);

    // Save search history securely
    const searchRecord = await AiDocumentSearch.create({
      user: req.user?.id || null,
      prompt: prompt.trim(),
      matchedDocuments: matched
        .filter((m) => mongoose.Types.ObjectId.isValid(m.id))
        .map((m) => ({
          document: m.id,
          score: typeof m.weight === "number" ? m.weight : 0,
        })),
    });

    return res.status(200).json({
      prompt,
      results,
      searchRecordId: searchRecord._id,
    });
  } catch (err) {
    console.error("Error in searchDocuments:", err);
    return next(err);
  }
};

const getUserSearchHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const history = await AiDocumentSearch.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("matchedDocuments.document")
      .lean();

    const formatted = history.map((record) => ({
      _id: record._id,
      prompt: record.prompt,
      createdAt: record.createdAt,
      matchedDocuments: (record.matchedDocuments || [])
        .filter((m) => m.document)
        .map((m) => ({
          ...m.document,
          relevanceScore: typeof m.score === "number" ? m.score : 0,
        })),
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("Error in getUserSearchHistory:", err);
    return next(err);
  }
};

const deleteUserSearchRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid search record ID." });
    }

    const record = await AiDocumentSearch.findOne({
      _id: id,
      user: req.user?.id,
    });
    if (!record) {
      return res
        .status(404)
        .json({ message: "Search record not found or not authorized." });
    }

    await record.deleteOne();
    return res
      .status(200)
      .json({ message: "Search record deleted successfully." });
  } catch (err) {
    console.error("Error in deleteUserSearchRecord:", err);
    return next(err);
  }
};

module.exports = {
  searchDocuments,
  getUserSearchHistory,
  deleteUserSearchRecord,
};
