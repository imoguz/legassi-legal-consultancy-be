module.exports = {
  "/users": {
    post: {
      summary: "Create a new user",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/User",
            },
          },
        },
      },
      responses: {
        201: {
          description: "User created successfully",
        },
        400: {
          description: "Bad Request - Invalid user input",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 400,
                message: "Username and email are required.",
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
                message: "Something went wrong while creating the user.",
              },
            },
          },
        },
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
        401: {
          description: "Unauthorized - Missing or invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 401,
                message: "Authentication required.",
              },
            },
          },
        },
        403: {
          description: "Forbidden - Admin only access",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 403,
                message: "You do not have permission to access this resource.",
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
                message: "An error occurred while fetching users.",
              },
            },
          },
        },
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
        400: {
          description: "Bad Request - Token missing",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 400,
                message: "Token query parameter is required.",
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 404,
                message: "No user found with this token.",
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
                message: "Failed to verify user.",
              },
            },
          },
        },
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
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 401,
                message: "Authentication required.",
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 404,
                message: "User not found.",
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
                message: "Error retrieving user.",
              },
            },
          },
        },
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
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 401,
                message: "Authentication required.",
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 404,
                message: "User not found.",
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
                message: "Failed to update user.",
              },
            },
          },
        },
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
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 401,
                message: "Authentication required.",
              },
            },
          },
        },
        403: {
          description: "Forbidden - Admin access required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 403,
                message: "Only admin users can delete a user.",
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 404,
                message: "User not found.",
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
                message: "Failed to delete user.",
              },
            },
          },
        },
      },
    },
  },
};
