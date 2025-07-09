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
                    items: { $ref: "#/components/schemas/Document" },
                  },
                  searchRecordId: { type: "string" },
                },
              },
            },
          },
        },
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
                items: {
                  $ref: "#/components/schemas/AiDocumentSearchHistoryRecord",
                },
              },
            },
          },
        },
      },
    },
  },

  "/ai-document-search/history/{id}": {
    delete: {
      summary: "Delete a document search record",
      tags: ["AI Document Search"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "The ID of the search record",
        },
      ],
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
      },
    },
  },
};
