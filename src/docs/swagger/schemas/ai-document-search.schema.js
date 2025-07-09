module.exports = {
  AiDocumentSearchHistoryRecord: {
    type: "object",
    properties: {
      _id: { type: "string" },
      prompt: { type: "string" },
      createdAt: {
        type: "string",
        format: "date-time",
      },
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
      content: { type: "string" },
      relevanceScore: {
        type: "number",
        example: 0.85,
      },
    },
  },

  Document: {
    type: "object",
    required: ["title", "description", "category", "url", "uploadedBy"],
    properties: {
      _id: {
        type: "string",
        description: "The auto-generated ID of the document",
      },
      title: {
        type: "string",
        description: "Title of the PDF document",
      },
      description: {
        type: "string",
        description: "Description of the document",
      },
      category: {
        type: "string",
        description: "Category of the document",
      },
      url: {
        type: "string",
        description: "URL of the uploaded document (Cloudinary)",
        format: "uri",
      },
      public_id: {
        type: "string",
        description: "Cloudinary public ID for the document",
      },
      uploadedBy: {
        type: "string",
        description: "Fullname of the admin who uploaded the document",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
    example: {
      _id: "6653f43b6a2c45f1a9e2d123",
      title: "Contract Sample",
      description: "Standard employment contract within the scope of labor law",
      category: "Labor law",
      url: "https://res.cloudinary.com/demo/raw/upload/v1710000000/contracts/sample.pdf",
      public_id: "contracts/sample",
      uploadedBy: "John Doe",
      createdAt: "2025-05-26T14:22:05.000Z",
      updatedAt: "2025-05-26T14:22:05.000Z",
    },
  },
};
