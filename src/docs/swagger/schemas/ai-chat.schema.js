module.exports = {
  AiChatMessage: {
    type: "object",
    properties: {
      _id: { type: "string", example: "66b9aef7e1a4d5c92a1f87ab" },
      user: { type: "string", example: "66b9aef7e1a4d5c92a1f87aa" },
      session: { type: "string", example: "66b9aef7e1a4d5c92a1f87ac" },
      prompt: { type: "string", example: "What is contract law?" },
      response: {
        type: "object",
        example: { text: "Contract law governs agreements between parties..." },
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  CreateChatMessageRequest: {
    type: "object",
    required: ["prompt"],
    properties: {
      prompt: { type: "string", example: "What is contract law?" },
    },
  },

  CreateChatMessageResponse: {
    type: "object",
    properties: {
      prompt: { type: "string", example: "What is contract law?" },
      response: {
        type: "object",
        example: { text: "Contract law governs agreements between parties..." },
      },
      session: {
        type: "object",
        properties: {
          _id: { type: "string", example: "66b9aef7e1a4d5c92a1f87ac" },
          title: { type: "string", example: "Contract Law Overview" },
          lastInteractionAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
