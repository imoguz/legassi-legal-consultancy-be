module.exports = {
  AiChatMessage: {
    type: "object",
    properties: {
      _id: { type: "string" },
      session: { type: "string" },
      user: { type: "string" },
      prompt: {
        type: "string",
        example: "What is the definition of tort law?",
      },
      response: {
        type: "object",
        example: {
          text: "Tort law refers to the body of laws that address and provide remedies for civil wrongs not arising out of contractual obligations.",
        },
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
  },
};
