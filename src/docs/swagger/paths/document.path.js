module.exports = {
  "/documents": {
    post: {
      summary: "Upload a new document",
      tags: ["Documents"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/DocumentCreateInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Document uploaded successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Document" },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    get: {
      summary: "List documents",
      tags: ["Documents"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: "#/components/parameters/page" },
        { $ref: "#/components/parameters/limit" },
        { $ref: "#/components/parameters/sortBy" },
        { $ref: "#/components/parameters/sortOrder" },
        { $ref: "#/components/parameters/search" },
        { $ref: "#/components/parameters/filters" },
      ],
      responses: {
        200: {
          description: "Paginated list of documents",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/PaginatedResponse" },
                  {
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Document" },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },

  "/documents/{id}": {
    get: {
      summary: "Get document by ID",
      tags: ["Documents"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        200: {
          description: "Document retrieved",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Document" },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    put: {
      summary: "Update an existing document",
      tags: ["Documents"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/DocumentUpdateInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Document updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Document" },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Soft delete a document",
      tags: ["Documents"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        204: { description: "Document marked as deleted" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },

  "/documents/purge/{id}": {
    delete: {
      summary: "Permanently delete a document",
      tags: ["Documents"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        204: { description: "Document purged successfully" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
