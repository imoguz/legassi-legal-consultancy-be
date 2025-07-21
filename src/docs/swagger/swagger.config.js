"use strict";

const packagejson = require("../../../package.json");
const userPaths = require("./paths/user.path");
const aiChatPaths = require("./paths/ai-chat.path.js");
const aiSessionPaths = require("./paths/ai-session.path.js");
const aiDocumentSearchPaths = require("./paths/ai-document-search.path.js");
const documentPaths = require("./paths/document.path");
const userSchemas = require("./schemas/user.schema");
const aiChatSchemas = require("./schemas/ai-chat.schema.js");
const aiSessionSchemas = require("./schemas/ai-session.schema.js");
const aiDocumentSearchSchemas = require("./schemas/ai-document-search.schema.js");
const documentSchemas = require("./schemas/document.schema");
const errorSchemas = require("./schemas/error.schema");
const sharedParameters = require("./components/parameters");
const sharedResponses = require("./components/responses");

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
      url: `${process.env.BACKEND_URL}/api/v1`,
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Users",
      description: "User management endpoints",
    },
    {
      name: "AI Chat",
      description: "AI Chat management endpoints",
    },
    {
      name: "AI Session",
      description: "AI Session management endpoints",
    },
    {
      name: "AI Document Search",
      description: "AI Document Search management endpoints",
    },
    {
      name: "Documents",
      description: "Document management endpoints",
    },
  ],
  paths: {
    ...userPaths,
    ...aiChatPaths,
    ...aiSessionPaths,
    ...aiDocumentSearchPaths,
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
      ...aiChatSchemas,
      ...aiSessionSchemas,
      ...aiDocumentSearchSchemas,
      ...documentSchemas,
      ...errorSchemas,
    },
    parameters: {
      ...sharedParameters,
    },
    responses: {
      ...sharedResponses,
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};
