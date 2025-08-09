const { id } = require("../components/parameters");

module.exports = {
  "/ai-document-search/query": {
    post: {
      summary: "Send a document search prompt",
      tags: ["AI Document Search"],
      security: [{ bearerAuth: [] }],
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
                  example: "Contract law basic principles",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Matched documents and saved search record ID",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  results: {
                    type: "array",
                    items: { $ref: "#/components/schemas/DocumentWithScore" },
                  },
                  searchRecordId: { type: "string" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/ai-document-search/history": {
    get: {
      summary: "Get user's document search history",
      tags: ["AI Document Search"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "List of user's past searches",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/AiDocumentSearchRecord" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/ai-document-search/history/{id}": {
    delete: {
      summary: "Delete a document search record",
      tags: ["AI Document Search"],
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        200: {
          description: "Confirmation message",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Search record deleted successfully.",
                  },
                },
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
  },
};
