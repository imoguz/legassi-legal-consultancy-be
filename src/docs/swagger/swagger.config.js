"use strict";

const packagejson = require("../../../package.json");
const userPaths = require("./paths/user.path");
const aiSearchPaths = require("./paths/ai-search.path.js");
const documentPaths = require("./paths/document.path");
const userSchemas = require("./schemas/user.schema");
const aiSearchSchemas = require("./schemas/ai-search.schema.js");
const documentSchemas = require("./schemas/document.schema");
const errorSchemas = require("./schemas/error.schema");

module.exports = {
  openapi: "3.0.0",
  info: {
    title: packagejson.name,
    version: packagejson.version,
    description: packagejson.description || "API Documentation",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 8000}/api/v1`,
      description: "Local server",
    },
    {
      url: `${process.env.PRODUCTION_URL}/api/v1`,
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Users",
      description: "User management endpoints",
    },
    {
      name: "AI Search",
      description: "AI Search management endpoints",
    },
    {
      name: "Documents",
      description: "Document management endpoints",
    },
  ],
  paths: {
    ...userPaths,
    ...aiSearchPaths,
    ...documentPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ...userSchemas,
      ...aiSearchSchemas,
      ...documentSchemas,
      ...errorSchemas,
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};
