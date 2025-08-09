module.exports = {
  "/ai-sessions": {
    post: {
      summary: "Create a new AI session",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateAiSessionRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Session created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AiSession" },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    get: {
      summary: "Get all sessions for the authenticated user",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "List of sessions",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/AiSession" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/ai-sessions/{id}": {
    get: {
      summary: "Get a single AI session by ID",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        200: {
          description: "Session retrieved",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AiSession" },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    put: {
      summary: "Update an AI session",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateAiSessionRequest" },
          },
        },
      },
      responses: {
        202: {
          description: "Session updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AiSession" },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Delete an AI session",
      tags: ["AI Session"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        204: { description: "Session deleted successfully" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
