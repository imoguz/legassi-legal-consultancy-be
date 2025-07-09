module.exports = {
  "/ai-session": {
    post: {
      summary: "Create a new AI chat session",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", example: "New Chat" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Session created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AISession" },
            },
          },
        },
      },
    },

    get: {
      summary: "Get all AI chat sessions of the authenticated user",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: "#/components/parameters/pageParam" },
        { $ref: "#/components/parameters/limitParam" },
        { $ref: "#/components/parameters/sortParam" },
        { $ref: "#/components/parameters/orderParam" },
        {
          in: "query",
          name: "search",
          schema: { type: "string" },
          description: "Search text in session titles",
        },
        {
          in: "query",
          name: "filters",
          schema: {
            type: "string",
            example: '{"isArchived":false}',
          },
          description: "MongoDB-style filters as JSON string",
        },
      ],
      responses: {
        200: {
          description: "Paginated list of sessions",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/AISession" },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      totalPages: { type: "integer" },
                      hasNextPage: { type: "boolean" },
                      hasPrevPage: { type: "boolean" },
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

  "/ai-session/{id}": {
    get: {
      summary: "Get a specific AI chat session by ID",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "Session ID",
        },
      ],
      responses: {
        200: {
          description: "Session data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AISession" },
            },
          },
        },
      },
    },

    put: {
      summary: "Update an AI chat session",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", example: "Updated Chat Title" },
                isArchived: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      responses: {
        202: {
          description: "Session updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AISession" },
            },
          },
        },
      },
    },

    delete: {
      summary: "Delete an AI chat session",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        204: { description: "Session deleted successfully" },
      },
    },
  },
};
