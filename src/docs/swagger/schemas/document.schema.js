module.exports = {
  Document: {
    type: "object",
    required: [
      "title",
      "description",
      "category",
      "fileUrl",
      "cloudinaryId",
      "uploadedBy",
    ],
    properties: {
      _id: { type: "string", example: "6653f43b6a2c45f1a9e2d123" },
      title: { type: "string", example: "Contract Sample" },
      description: { type: "string", example: "Standard employment contract" },
      category: { type: "string", example: "Labor law" },
      fileUrl: {
        type: "string",
        format: "uri",
        example:
          "https://res.cloudinary.com/demo/raw/upload/contracts/sample.pdf",
      },
      cloudinaryId: { type: "string", example: "contracts/sample" },
      uploadedBy: { type: "string", example: "John Doe" },
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
      category: { type: "string", example: "Labor law" },
      file: { type: "string", format: "binary" },
    },
  },
  DocumentUpdateInput: {
    type: "object",
    properties: {
      title: { type: "string", example: "Updated Contract" },
      description: { type: "string", example: "Updated description" },
      category: { type: "string", example: "Corporate law" },
    },
  },
};
