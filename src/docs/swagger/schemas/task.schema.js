module.exports = {
  Task: {
    type: "object",
    properties: {
      _id: { type: "string" },
      matter: { type: "string", description: "Matter ID" },
      title: { type: "string" },
      description: { type: "string" },
      assignedTo: { type: "string", description: "User ID" },
      dueDate: { type: "string", format: "date-time" },
      status: {
        type: "string",
        enum: ["open", "in-progress", "completed"],
        default: "open",
      },
      priority: {
        type: "string",
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      isDeleted: { type: "boolean" },
      createdBy: { type: "string", description: "User ID" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    example: {
      _id: "66b1c2d3e4f5067890123456",
      matter: "66a1b2c3d4e5f67890123456",
      title: "Draft contract amendment",
      description: "Prepare updated NDA for client review",
      assignedTo: "66a1b2c3d4e5f67890120001",
      dueDate: "2025-09-15T00:00:00.000Z",
      status: "open",
      priority: "high",
    },
  },
};
