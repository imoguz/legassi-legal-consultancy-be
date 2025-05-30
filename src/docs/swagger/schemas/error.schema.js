module.exports = {
  ErrorResponse: {
    type: "object",
    properties: {
      statusCode: {
        type: "integer",
        example: 400,
      },
      message: {
        type: "string",
        example: "Bad request: missing required field",
      },
      errors: {
        type: "object",
        additionalProperties: {
          type: "string",
        },
        example: {
          email: "Must be a valid email address",
          password: "Password must be at least 8 characters",
        },
      },
    },
    example: {
      statusCode: 400,
      message: "Validation failed",
      errors: {
        email: "Must be a valid email address",
        password: "Password must contain at least one number",
      },
    },
  },
};
