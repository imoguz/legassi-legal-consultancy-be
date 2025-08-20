module.exports = {
  "/matters": {
    post: {
      summary: "Create a new matter",
      tags: ["Matters"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Matter" },
          },
        },
      },
      responses: {
        201: {
          description: "Matter created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Matter" },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
    get: {
      summary: "List all matters",
      tags: ["Matters"],
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
          description: "Paginated list of matters",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/PaginatedResponse" },
                  {
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Matter" },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "/matters/{id}": {
    get: {
      summary: "Get a single matter",
      tags: ["Matters"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        200: {
          description: "Matter details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Matter" },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    put: {
      summary: "Update a matter",
      tags: ["Matters"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Matter" },
          },
        },
      },
      responses: {
        200: {
          description: "Updated matter",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Matter" },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Soft delete a matter (mark as deleted)",
      tags: ["Matters"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        204: { description: "No Content" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/matters/purge/{id}": {
    delete: {
      summary: "Permanently delete a matter (purge)",
      tags: ["Matters"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        204: { description: "No Content" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
