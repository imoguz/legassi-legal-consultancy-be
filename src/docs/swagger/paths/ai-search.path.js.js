module.exports = {
  "/ai-search": {
    post: {
      summary: "Send a legal question to the AI service",
      tags: ["AI Search"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AIQuery" },
          },
        },
      },
      responses: {
        200: {
          description: "AI response to the query",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AIResponse" },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/ai-search/user-queries": {
    get: {
      summary: "Retrieve past AI search queries of the authenticated user",
      tags: ["AI Search"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "List of previous queries",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/AIQueryHistory" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
};
