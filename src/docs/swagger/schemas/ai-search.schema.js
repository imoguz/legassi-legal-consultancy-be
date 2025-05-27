module.exports = {
  AIResponse: {
    type: "object",
    properties: {
      result: {
        type: "object",
        properties: {
          answer: {
            type: "string",
            example:
              "Alimony is typically calculated based on several factors...",
          },
          confidence: {
            type: "number",
            example: 0.95,
          },
          source: {
            type: "string",
            example: "mock",
          },
        },
      },
    },
  },
  AIQuery: {
    type: "object",
    required: ["query"],
    properties: {
      query: {
        type: "string",
        example: "How is alimony calculated in a divorce case?",
      },
    },
  },
  AIQueryHistory: {
    type: "object",
    properties: {
      _id: {
        type: "string",
      },
      query: {
        type: "string",
      },
      response: {
        type: "object",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },
};
