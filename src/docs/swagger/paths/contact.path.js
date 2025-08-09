const {
  page,
  limit,
  sortBy,
  sortOrder,
  search,
  filters,
  id,
} = require("../components/parameters");

module.exports = {
  "/contacts": {
    post: {
      summary: "Create a new contact",
      tags: ["Contacts"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateContactInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Contact created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Contact" },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    get: {
      summary: "Get list of contacts",
      tags: ["Contacts"],
      security: [{ bearerAuth: [] }],
      parameters: [page, limit, sortBy, sortOrder, search, filters],
      responses: {
        200: {
          description: "Paginated list of contacts",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/PaginatedResponse" },
                  {
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Contact" },
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
  "/contacts/{id}": {
    get: {
      summary: "Get a contact by ID",
      tags: ["Contacts"],
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        200: {
          description: "Contact details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Contact" },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    put: {
      summary: "Update a contact by ID",
      tags: ["Contacts"],
      security: [{ bearerAuth: [] }],
      parameters: [id],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateContactInput" },
          },
        },
      },
      responses: {
        202: {
          description: "Contact updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Contact" },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      summary: "Delete a contact by ID",
      tags: ["Contacts"],
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        204: { description: "Contact deleted successfully" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
