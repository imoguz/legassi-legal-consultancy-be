"use strict";

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      const err = new Error("Authorization token missing");
      err.statusCode = 401;
      throw err;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_KEY);

    // Attach info (id, role)
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      err.statusCode = 401;
      err.message = "Access token expired";
    } else if (err.name === "JsonWebTokenError") {
      err.statusCode = 401;
      err.message = "Invalid token";
    }
    next(err);
  }
};
