module.exports = {
  AiDocumentSearchRecord: {
    type: "object",
    properties: {
      _id: { type: "string", example: "66b5c44f5d2d0a12ab34f123" },
      prompt: { type: "string", example: "Contract law basic principles" },
      createdAt: { type: "string", format: "date-time" },
      matchedDocuments: {
        type: "array",
        items: { $ref: "#/components/schemas/DocumentWithScore" },
      },
    },
  },
  DocumentWithScore: {
    type: "object",
    properties: {
      _id: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      category: { type: "string" },
      url: { type: "string", format: "uri" },
      public_id: { type: "string" },
      uploadedBy: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      relevanceScore: { type: "number", example: 0.85 },
    },
  },
};
