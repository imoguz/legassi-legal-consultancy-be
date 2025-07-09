"use strict";

const AiDocumentSearch = require("../models/aiDocumentSearch.model");
const Document = require("../models/document.model");
const {
  sendPromptToDocumentAIService,
} = require("../services/aiDocumentSearch.service");

const searchDocuments = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    const matched = await sendPromptToDocumentAIService(prompt);

    if (!matched?.length) {
      return res.status(200).send({
        prompt,
        results: [],
      });
    }

    // fetch matched documents from the database
    const docIds = matched.map((m) => m.id);
    const documents = await Document.find({ _id: { $in: docIds } });

    // combine scores with documents
    const results = matched
      .map((m) => {
        const doc = documents.find((d) => d._id.toString() === m.id);
        if (!doc) return null;
        return {
          ...doc.toObject(),
          relevanceScore: m.weight,
        };
      })
      .filter(Boolean);

    // save search record
    const searchRecord = await AiDocumentSearch.create({
      user: req.user.id,
      prompt,
      matchedDocuments: matched.map((m) => ({
        document: m.id,
        score: m.weight,
      })),
    });

    res.status(200).send({
      prompt,
      results,
      searchRecordId: searchRecord._id,
    });
  } catch (err) {
    next(err);
  }
};

// user search history
const getUserSearchHistory = async (req, res, next) => {
  try {
    const history = await AiDocumentSearch.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("matchedDocuments.document");

    const formatted = history.map((record) => ({
      _id: record._id,
      prompt: record.prompt,
      createdAt: record.createdAt,
      matchedDocuments: record.matchedDocuments.map((m) => ({
        ...m.document.toObject(),
        relevanceScore: m.score,
      })),
    }));

    res.status(200).send(formatted);
  } catch (err) {
    next(err);
  }
};

const deleteUserSearchRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Search record ID is required." });
    }

    const record = await AiDocumentSearch.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!record) {
      return res.status(404).json({ message: "Search record not found." });
    }

    await record.deleteOne();

    res.status(200).json({ message: "Search record deleted successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchDocuments,
  getUserSearchHistory,
  deleteUserSearchRecord,
};
