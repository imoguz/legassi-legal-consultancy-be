module.exports = {
  "/users": {
    post: {
      summary: "Create a new user",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/User" },
          },
        },
      },
      responses: {
        201: { description: "User created successfully" },
        400: { $ref: "#/components/responses/BadRequest" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
    get: {
      summary: "Get list of users (Admin only)",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
          description: "Page number",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
          description: "Items per page",
        },
        {
          in: "query",
          name: "sort",
          schema: { type: "string", default: "-createdAt" },
          description: "Sort order",
        },
        {
          in: "query",
          name: "search",
          schema: { type: "string" },
          description: "Search term",
        },
        {
          in: "query",
          name: "fields",
          schema: { type: "string" },
          description: "Comma-separated fields to return",
        },
      ],
      responses: {
        200: {
          description: "List of users",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/users/verify": {
    get: {
      summary: "Verify user email",
      tags: ["Users"],
      parameters: [
        {
          in: "query",
          name: "token",
          required: true,
          schema: { type: "string" },
          description: "Verification token",
        },
      ],
      responses: {
        302: { description: "Redirect to success or error page" },
        400: { $ref: "#/components/responses/BadRequest" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/users/{id}": {
    get: {
      summary: "Get a user by ID",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "User ID",
        },
      ],
      responses: {
        200: {
          description: "User data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },

    put: {
      summary: "Update a user",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "User ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/User" },
          },
        },
      },
      responses: {
        202: { description: "User updated successfully" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },

    delete: {
      summary: "Delete a user (Admin only)",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "User ID",
        },
      ],
      responses: {
        204: { description: "User deleted successfully" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
};
