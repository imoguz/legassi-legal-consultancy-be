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
      summary:
        "Retrieve paginated AI search query history of the authenticated user",
      tags: ["AI Search"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
          description: "Page number for pagination",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
          description: "Number of items per page",
        },
        {
          in: "query",
          name: "sort",
          schema: { type: "string", default: "createdAt" },
          description: "Field to sort by (e.g., createdAt, query)",
        },
        {
          in: "query",
          name: "order",
          schema: {
            type: "string",
            enum: ["asc", "desc"],
            default: "desc",
          },
          description: "Sort order (ascending or descending)",
        },
        {
          in: "query",
          name: "search",
          schema: { type: "string" },
          description: "Text to search in 'query' field",
        },
        {
          in: "query",
          name: "filters",
          schema: {
            type: "string",
            example: '{"response.someKey":"someValue"}',
          },
          description: "Optional MongoDB-style filters encoded as JSON string",
        },
      ],
      responses: {
        200: {
          description: "Paginated list of previous AI queries",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total: { type: "integer", example: 42 },
                  page: { type: "integer", example: 1 },
                  pages: { type: "integer", example: 5 },
                  limit: { type: "integer", example: 10 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/AIQueryHistory" },
                  },
                },
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
