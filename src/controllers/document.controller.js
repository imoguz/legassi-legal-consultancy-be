const documentService = require("../services/document.service");

module.exports = {
  uploadDocument: async (req, res) => {
    try {
      const document = await documentService.uploadDocument(req);
      res.status(201).json(document);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getDocuments: async (_req, res) => {
    try {
      const docs = await documentService.getAllDocuments();
      res.status(200).json(docs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  deleteDocument: async (req, res) => {
    try {
      await documentService.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateDocument: async (req, res) => {
    try {
      const doc = await documentService.updateDocument(req.params.id, req.body);
      res.status(200).json(doc);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
