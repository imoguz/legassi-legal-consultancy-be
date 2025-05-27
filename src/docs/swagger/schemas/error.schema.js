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
    },
  },
};
