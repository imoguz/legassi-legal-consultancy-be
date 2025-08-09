module.exports = {
  BadRequest: {
    description: "Invalid request data",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { statusCode: 400, message: "Validation error" },
      },
    },
  },
  Unauthorized: {
    description: "Authentication required",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { statusCode: 401, message: "Authentication required" },
      },
    },
  },
  NotFound: {
    description: "Resource not found",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { statusCode: 404, message: "Not found" },
      },
    },
  },
  ServerError: {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { statusCode: 500, message: "Internal server error" },
      },
    },
  },
};
