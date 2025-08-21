module.exports = {
  "/tasks": {
    post: {
      summary: "Create a new task",
      tags: ["Tasks"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Task" },
          },
        },
      },
      responses: {
        201: {
          description: "Task created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Task" },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    get: {
      summary: "List all tasks (paginated & filtered)",
      tags: ["Tasks"],
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
          description: "Paginated list of tasks",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/PaginatedResponse" },
                  {
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Task" },
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

  "/tasks/{id}": {
    get: {
      summary: "Get a single task",
      tags: ["Tasks"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        200: {
          description: "Task details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Task" },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
    put: {
      summary: "Update a task",
      tags: ["Tasks"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Task" },
          },
        },
      },
      responses: {
        200: {
          description: "Updated task",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Task" },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFound" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
    delete: {
      summary: "Soft delete a task (mark as deleted)",
      tags: ["Tasks"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        204: { description: "No Content" },
        404: { $ref: "#/components/responses/NotFound" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },

  "/tasks/purge/{id}": {
    delete: {
      summary: "Permanently delete a task (purge)",
      tags: ["Tasks"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        204: { description: "No Content" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },

  "/tasks/matter/list": {
    get: {
      summary: "Get available matters for task assignment",
      tags: ["Tasks"],
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
          description: "List of matters for task creation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        matterId: { type: "string" },
                        title: { type: "string" },
                        matterNumber: { type: "string" },
                      },
                    },
                  },
                  pagination: { $ref: "#/components/schemas/Pagination" },
                },
              },
            },
          },
        },
      },
    },
  },
};
