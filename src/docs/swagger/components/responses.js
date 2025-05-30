module.exports = {
  // 400 Bad Request
  BadRequest: {
    description: "The request contains invalid data",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          statusCode: 400,
          message: "Validation error",
          errors: {
            email: "Invalid email format",
            password: "Password must be 8-32 characters",
          },
        },
      },
    },
  },

  // 401 Unauthorized
  Unauthorized: {
    description: "Authentication credentials are missing or invalid",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          statusCode: 401,
          message: "Authentication required",
        },
      },
    },
  },

  // 403 Forbidden
  Forbidden: {
    description: "User doesn't have permission to access this resource",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          statusCode: 403,
          message: "Insufficient permissions",
        },
      },
    },
  },

  // 404 Not Found
  NotFound: {
    description: "The requested resource was not found",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          statusCode: 404,
          message: "User not found",
        },
      },
    },
  },

  // 500 Internal Server Error
  ServerError: {
    description: "An unexpected server error occurred",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          statusCode: 500,
          message: "Internal server error",
        },
      },
    },
  },
};
