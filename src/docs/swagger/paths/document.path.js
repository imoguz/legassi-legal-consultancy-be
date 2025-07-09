const {
  pageParam,
  limitParam,
  sortParam,
  orderParam,
  searchParam,
  filtersParam,
  documentIdParam,
} = require("../components/parameters");

module.exports = {
  "/documents": {
    get: {
      summary: "Retrieve a list of documents",
      description:
        "Fetches a paginated list of documents with optional filters, sorting, and search.",
      tags: ["Documents"],
      parameters: [
        searchParam,
        pageParam,
        limitParam,
        sortParam,
        orderParam,
        filtersParam,
      ],
      responses: {
        200: {
          description: "Documents retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Document" },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      total: { type: "integer", example: 45 },
                      page: { type: "integer", example: 1 },
                      limit: { type: "integer", example: 10 },
                      totalPages: { type: "integer", example: 5 },
                      hasNextPage: { type: "boolean", example: true },
                      hasPrevPage: { type: "boolean", example: false },
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

  "/documents/{id}": {
    get: {
      summary: "Retrieve a single document",
      description:
        "Fetches detailed information of a document by its unique identifier.",
      tags: ["Documents"],
      parameters: [documentIdParam],
      responses: {
        200: {
          description: "Document retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Document",
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete a document",
      description:
        "Removes a document by its unique ID. Admin access required.",
      tags: ["Documents"],
      parameters: [documentIdParam],
      responses: {
        200: {
          description: "Document deleted successfully.",
        },
      },
    },
    put: {
      summary: "Update a document",
      description:
        "Updates the metadata of a document by ID. Admin access required.",
      tags: ["Documents"],
      parameters: [documentIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Document",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Document updated successfully.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Document",
              },
            },
          },
        },
      },
    },
  },
};
