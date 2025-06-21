module.exports = {
  AISession: {
    type: "object",
    properties: {
      _id: { type: "string", example: "665e7b1a271d282d0a5f7851" },
      user: { type: "string", example: "665e7b19271d282d0a5f784f" },
      title: { type: "string", example: "Chat with AI on labor law" },
      isArchived: { type: "boolean", example: false },
      lastInteractionAt: {
        type: "string",
        format: "date-time",
        example: "2024-06-20T12:00:00.000Z",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-06-20T11:59:00.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-06-20T12:01:00.000Z",
      },
    },
  },
};
