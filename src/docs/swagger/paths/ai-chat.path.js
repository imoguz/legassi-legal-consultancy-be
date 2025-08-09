module.exports = {
  "/ai-chat/{sessionId}/messages": {
    post: {
      summary: "Create a new AI chat message",
      description: "Sends a prompt to the AI service and stores the response.",
      tags: ["AI Chat"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateChatMessageRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Message created successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateChatMessageResponse",
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
    get: {
      summary: "Get all messages in a chat session",
      tags: ["AI Chat"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
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
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
};
