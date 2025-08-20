module.exports = {
  Document: {
    type: "object",
    required: [
      "title",
      "description",
      "category",
      "documentType",
      "fileUrl",
      "cloudinaryId",
      "uploadedBy",
    ],
    properties: {
      _id: { type: "string", example: "6653f43b6a2c45f1a9e2d123" },
      title: { type: "string", example: "Contract Sample" },
      description: { type: "string", example: "Standard employment contract" },
      category: { type: "string", example: "Contracts" },
      documentType: {
        type: "string",
        enum: ["public", "private"],
        example: "public",
      },
      fileUrl: {
        type: "string",
        format: "uri",
        example:
          "https://res.cloudinary.com/demo/raw/upload/contracts/sample.pdf",
      },
      fileSize: { type: "string", example: "1.2MB" },
      fileType: { type: "string", example: "application/pdf" },
      cloudinaryId: { type: "string", example: "contracts/sample" },
      uploadedBy: { type: "string", example: "6653f43b6a2c45f1a9e2d456" },
      matterId: { type: "string", description: "Related matter ID" },
      isDeleted: { type: "boolean", example: false },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  DocumentCreateInput: {
    type: "object",
    required: ["title", "description", "category", "file"],
    properties: {
      title: { type: "string", example: "Contract Sample" },
      description: { type: "string", example: "Standard employment contract" },
      category: { type: "string", example: "Contracts" },
      documentType: {
        type: "string",
        enum: ["public", "private"],
        example: "private",
      },
      file: { type: "string", format: "binary" },
      fileSize: { type: "string", example: "1.2MB" },
      fileType: { type: "string", example: "application/pdf" },
      matterId: { type: "string", description: "Optional related matter ID" },
    },
  },

  DocumentUpdateInput: {
    type: "object",
    properties: {
      title: { type: "string", example: "Updated Contract" },
      description: { type: "string", example: "Updated description" },
      category: { type: "string", example: "Corporate Documents" },
      documentType: {
        type: "string",
        enum: ["public", "private"],
        example: "public",
      },
      fileSize: { type: "string", example: "1.5MB" },
      fileType: { type: "string", example: "application/pdf" },
      matterId: { type: "string", description: "Optional related matter ID" },
    },
  },
};
