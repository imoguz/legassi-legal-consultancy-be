"use strict";

const pkg = require("../../../package.json");
const parameters = require("./components/parameters");
const responses = require("./components/responses");
const commonSchemas = require("./schemas/common.schema");
const errorSchemas = require("./schemas/error.schema");

const authPaths = require("./paths/auth.path");
const authSchemas = require("./schemas/auth.schema");
const userPaths = require("./paths/user.path");
const userSchemas = require("./schemas/user.schema");
const matterPaths = require("./paths/matter.path");
const matterSchemas = require("./schemas/matter.schema");
const aiChatSchemas = require("./schemas/ai-chat.schema");
const aiChatPaths = require("./paths/ai-chat.path");
const aiDocumentSearchPaths = require("./paths/aiDocumentSearch.path");
const aiDocumentSearchSchemas = require("./schemas/aiDocumentSearch.schema");
const aiSessionPaths = require("./paths/ai-session.path");
const aiSessionSchemas = require("./schemas/ai-session.schema");
const contactPaths = require("./paths/contact.path");
const contactSchemas = require("./schemas/contact.schema");
const documentPaths = require("./paths/document.path");
const documentSchemas = require("./schemas/document.schema");

module.exports = {
  openapi: "3.0.0",
  info: {
    title: "Codencia Legal Consultancy API",
    version: pkg.version,
    description: pkg.description || "API Documentation",
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
    { name: "Auth", description: "User authentication operations" },
    { name: "Users", description: "User management operations" },
    { name: "AI Chat", description: "AI chat interactions" },
    { name: "AI Session", description: "AI session management" },
    {
      name: "AI Document Search",
      description: "AI-powered document search operations",
    },
    { name: "Matters", description: "Matter/Case management operations" },
    { name: "Contacts", description: "Contact management operations" },
    { name: "Documents", description: "Document management operations" },
  ],
  paths: {
    ...authPaths,
    ...userPaths,
    ...matterPaths,
    ...aiChatPaths,
    ...aiDocumentSearchPaths,
    ...aiSessionPaths,
    ...contactPaths,
    ...documentPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    parameters,
    responses,
    schemas: {
      ...authSchemas,
      ...commonSchemas,
      ...errorSchemas,
      ...matterSchemas,
      ...aiChatSchemas,
      ...aiDocumentSearchSchemas,
      ...userSchemas,
      ...aiSessionSchemas,
      ...contactSchemas,
      ...documentSchemas,
    },
  },
  security: [{ bearerAuth: [] }],
};
