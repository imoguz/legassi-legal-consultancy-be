module.exports = {
  AiSession: {
    type: "object",
    properties: {
      _id: { type: "string", example: "66a1f4d9c1e9a2b3f8e12345" },
      user: { type: "string", description: "User ID (ObjectId)" },
      title: { type: "string", example: "My Legal Chat" },
      lastInteractionAt: {
        type: "string",
        format: "date-time",
        example: "2025-08-09T14:48:00.000Z",
      },
      isArchived: { type: "boolean", example: false },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2025-08-09T14:48:00.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2025-08-09T14:50:00.000Z",
      },
    },
  },
  CreateAiSessionRequest: {
    type: "object",
    properties: {
      title: { type: "string", example: "New Chat" },
    },
  },
  UpdateAiSessionRequest: {
    type: "object",
    properties: {
      title: { type: "string", example: "Updated Chat Title" },
      isArchived: { type: "boolean", example: true },
    },
  },
};
