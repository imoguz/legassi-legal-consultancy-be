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
  "/employees": {
    post: {
      summary: "Create a new employee",
      tags: ["Employees"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EmployeeCreateInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Employee created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Employee" },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },

    get: {
      summary: "Get list of employees (paginated)",
      tags: ["Employees"],
      security: [{ bearerAuth: [] }],
      parameters: [page, limit, sortBy, sortOrder, search, filters],
      responses: {
        200: {
          description: "Paginated employee list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Employee" },
                  },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
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

  "/employees/{id}": {
    get: {
      summary: "Get an employee by ID",
      tags: ["Employees"],
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        200: {
          description: "Employee details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Employee" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },

    put: {
      summary: "Update an employee",
      tags: ["Employees"],
      security: [{ bearerAuth: [] }],
      parameters: [id],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EmployeeUpdateInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Employee updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Employee" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },

    delete: {
      summary: "Soft delete an employee",
      tags: ["Employees"],
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        204: { description: "Employee deleted successfully (no content)" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/employees/purge/{id}": {
    delete: {
      summary: "Permanently delete an employee (Admin only)",
      tags: ["Employees"],
      security: [{ bearerAuth: [] }],
      parameters: [id],
      responses: {
        204: { description: "Employee permanently deleted" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/ServerError" },
      },
    },
  },
};
