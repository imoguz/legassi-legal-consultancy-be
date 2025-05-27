module.exports = {
  User: {
    type: "object",
    required: ["firstname", "lastname", "email", "password"],
    properties: {
      _id: {
        type: "string",
        description: "The auto-generated ID of the user",
      },
      firstname: {
        type: "string",
      },
      lastname: {
        type: "string",
      },
      email: {
        type: "string",
        format: "email",
      },
      password: {
        type: "string",
        format: "password",
        writeOnly: true,
      },
      profileUrl: {
        type: "string",
      },
      role: {
        type: "string",
        enum: ["user", "admin", "lawyer"],
        default: "user",
      },
      isVerified: {
        type: "boolean",
        default: false,
      },
      isActive: {
        type: "boolean",
        default: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
    example: {
      _id: "60d21b4667d0d8992e610c85",
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      role: "user",
      isVerified: true,
      isActive: true,
      createdAt: "2021-06-23T14:24:06.000Z",
      updatedAt: "2021-06-23T14:24:06.000Z",
    },
  },
};
