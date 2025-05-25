"use strict";

const swaggerJsdoc = require("swagger-jsdoc");
const packagejson = require("../../package.json");

const options = {
  definition: {
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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
