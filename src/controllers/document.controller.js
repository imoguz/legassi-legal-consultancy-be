"use strict";

const documentService = require("../services/document.service");

module.exports = {
  uploadDocument: async (req, res) => {
    try {
      const document = await documentService.uploadDocument(req);
      res.status(201).send(document);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  getDocument: async (req, res) => {
    try {
      const docs = await documentService.getOneDocument(req.params.id);
      res.status(200).send(docs);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  getDocuments: async (req, res) => {
    try {
      const docs = await documentService.getAllDocuments();
      res.status(200).send(docs);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  deleteDocument: async (req, res) => {
    try {
      await documentService.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  updateDocument: async (req, res) => {
    try {
      const doc = await documentService.updateDocument(req.params.id, req.body);
      res.status(200).send(doc);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },
};
