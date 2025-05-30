module.exports = {
  User: {
    type: "object",
    required: ["firstname", "lastname", "email", "password"],
    properties: {
      _id: {
        type: "string",
        description: "The auto-generated ID of the user",
        example: "60d21b4667d0d8992e610c85",
      },
      firstname: {
        type: "string",
        example: "John",
      },
      lastname: {
        type: "string",
        example: "Doe",
      },
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
      },
      password: {
        type: "string",
        format: "password",
        writeOnly: true,
        description:
          "8-32 chars, mix of uppercase, lowercase, numbers & special chars",
      },
      profileUrl: {
        type: "string",
        example: "https://example.com/profiles/john.jpg",
      },
      role: {
        type: "string",
        enum: ["user", "admin", "lawyer"],
        default: "user",
        example: "user",
      },
      isVerified: {
        type: "boolean",
        default: false,
        example: true,
      },
      isActive: {
        type: "boolean",
        default: true,
        example: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2021-06-23T14:24:06.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2021-06-23T14:24:06.000Z",
      },
    },
  },

  UserListResponse: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/User" },
      },
      pagination: {
        type: "object",
        properties: {
          total: { type: "integer", example: 100 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          totalPages: { type: "integer", example: 10 },
          hasNextPage: { type: "boolean", example: true },
          hasPrevPage: { type: "boolean", example: false },
        },
      },
    },
  },
};
