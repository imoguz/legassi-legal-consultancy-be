module.exports = {
  "/ai-search": {
    post: {
      summary: "Send a legal question to the AI service.",
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
        400: {
          description: "Bad Request – Missing query",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 400,
                message: "Query field is required.",
              },
            },
          },
        },
        401: {
          description: "Unauthorized – Missing or invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 401,
                message: "Authentication token missing or invalid.",
              },
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 500,
                message: "AI service is unavailable. Please try again later.",
              },
            },
          },
        },
      },
    },
  },

  "/ai-search/user-queries": {
    get: {
      summary: "Retrieve past AI search queries of the authenticated user.",
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
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 401,
                message: "You must be logged in to access this resource.",
              },
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 500,
                message: "Unable to fetch query history.",
              },
            },
          },
        },
      },
    },
  },
};
