"use strict";

// ----- Run app on express -----
const express = require("express");
const app = express();

// ----- .env variables -----
require("dotenv").config();
const PORT = process.env.PORT || 8000;
const packagejson = require("./package.json");

// ----- Security Headers with Helmet -----
const helmet = require("helmet");
app.use(helmet());

// ----- Database Connection -----
require("./src/configs/dbConnection")();

// ----- HTTP Logging with Morgan -----
// if (process.env.NODE_ENV === "development") {
//   app.use(require("morgan")("dev"));
// }

// ----- Convert to JSON -----
app.use(express.json());

// ----- cors configuration -----
const cors = require("cors");

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(","),
  credentials: true, // Required for sessions with cookies
};

app.use(cors(corsOptions));

// ----- Rate Limiting -----
const { globalLimiter } = require("./src/middlewares/rateLimiter");
app.use(globalLimiter);

// ----- middlewares -----
const queryHandler = require("./src/middlewares/queryHandler");
// const logger = require("./src/middlewares/logger");

app.use(queryHandler);
// app.use(logger);

// ----- routes -----
const routes = require("./src/routes");
app.use("/api/v1", routes);

// ----- main path -----
app.all("/", (req, res) => {
  res.send({
    message: "Welcome to " + packagejson.name,
    user: req.user ? req.user : null,
  });
});

// ----- 404 Catch-All Middleware -----
app.use((req, res, next) => {
  res.status(404).json({ error: "Not found" });
});

// ----- Error Handler -----
const errorHandler = require("./src/middlewares/errorHandler");
app.use(errorHandler);

// ----- listenning server -----
app.listen(PORT, () => console.log("Server is running on", PORT));
