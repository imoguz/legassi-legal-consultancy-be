module.exports = {
  "/documents": {
    post: {
      summary: "Upload a new document (Admin only)",
      tags: ["Documents"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                },
                title: {
                  type: "string",
                },
                description: {
                  type: "string",
                },
              },
              required: ["file", "title"],
            },
          },
        },
      },
      responses: {
        201: { description: "Document uploaded successfully" },
        400: {
          description: "Bad Request - Missing file or title",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 400,
                message: "File and title are required.",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Admin access required",
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
          description: "Forbidden - Only admin can upload",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 403,
                message: "Only admins can upload documents.",
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
                message: "Failed to upload document.",
              },
            },
          },
        },
      },
    },

    get: {
      summary: "Get list of documents (Public)",
      tags: ["Documents"],
      parameters: [
        {
          in: "query",
          name: "search",
          schema: { type: "string" },
          description: "Search term",
        },
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
      ],
      responses: {
        200: {
          description: "List of documents",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Document" },
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
                message: "Error fetching documents.",
              },
            },
          },
        },
      },
    },
  },

  "/documents/{id}": {
    get: {
      summary: "Get a document by ID",
      tags: ["Documents"],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "Document ID",
        },
      ],
      responses: {
        200: {
          description: "Document data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Document" },
            },
          },
        },
        404: {
          description: "Document not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 404,
                message: "Document not found.",
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
                message: "Failed to retrieve document.",
              },
            },
          },
        },
      },
    },

    put: {
      summary: "Update a document (Admin only)",
      tags: ["Documents"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "Document ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        202: { description: "Document updated successfully" },
        404: {
          description: "Document not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 404,
                message: "Document not found.",
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
                message: "Authentication required.",
              },
            },
          },
        },
        500: {
          description: "Failed to update document",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 500,
                message: "Internal server error.",
              },
            },
          },
        },
      },
    },

    delete: {
      summary: "Delete a document (Admin only)",
      tags: ["Documents"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "Document ID",
        },
      ],
      responses: {
        204: { description: "Document deleted successfully" },
        404: {
          description: "Document not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 404,
                message: "Document not found.",
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
                message: "Authentication required.",
              },
            },
          },
        },
        403: {
          description: "Forbidden - Admin only",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 403,
                message: "Only admins can delete documents.",
              },
            },
          },
        },
        500: {
          description: "Failed to delete document",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                statusCode: 500,
                message: "Internal server error.",
              },
            },
          },
        },
      },
    },
  },
};
