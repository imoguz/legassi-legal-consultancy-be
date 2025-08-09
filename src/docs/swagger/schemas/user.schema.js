module.exports = {
  User: {
    type: "object",
    properties: {
      _id: { type: "string", example: "64fa8e72e2d4e1a1c2345678" },
      firstname: { type: "string", example: "John" },
      lastname: { type: "string", example: "Doe" },
      email: { type: "string", format: "email", example: "john@example.com" },
      profileUrl: {
        type: "string",
        example: "https://cdn.example.com/profile.jpg",
      },
      role: {
        type: "string",
        enum: ["user", "admin", "lawyer"],
        example: "user",
      },
      isVerified: { type: "boolean", example: false },
      isActive: { type: "boolean", example: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateUserInput: {
    type: "object",
    required: ["firstname", "lastname", "email", "password"],
    properties: {
      firstname: { type: "string", example: "John" },
      lastname: { type: "string", example: "Doe" },
      email: { type: "string", format: "email", example: "john@example.com" },
      password: { type: "string", example: "StrongP@ssw0rd" },
      role: {
        type: "string",
        enum: ["user", "admin", "lawyer"],
        example: "user",
      },
    },
  },
  UpdateUserInput: {
    type: "object",
    properties: {
      firstname: { type: "string", example: "John" },
      lastname: { type: "string", example: "Doe" },
      email: { type: "string", format: "email", example: "john@example.com" },
      password: { type: "string", example: "StrongP@ssw0rd" },
      profileUrl: {
        type: "string",
        example: "https://cdn.example.com/profile.jpg",
      },
      role: {
        type: "string",
        enum: ["user", "admin", "lawyer"],
        example: "user",
      },
      isActive: { type: "boolean", example: true },
    },
  },
};
