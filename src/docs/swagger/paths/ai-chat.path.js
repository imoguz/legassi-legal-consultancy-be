module.exports = {
  "/ai-chat/{sessionId}/messages": {
    post: {
      summary: "Send a prompt to the AI chat session",
      tags: ["AI Chat"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "sessionId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the AI session",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["prompt"],
              properties: {
                prompt: {
                  type: "string",
                  example: "What are the elements of a valid contract?",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "AI response and updated session data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  response: { type: "object" },
                  session: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      title: { type: "string" },
                      lastInteractionAt: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    get: {
      summary: "Get chat messages from a session",
      tags: ["AI Chat"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "sessionId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the AI session",
        },
      ],
      responses: {
        200: {
          description: "List of chat messages",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/AiChatMessage" },
              },
            },
          },
        },
      },
    },
  },
};
