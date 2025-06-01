"use strict";

const jwt = require("jsonwebtoken");
const setJWT = require("../helpers/setJWT");
const TokenBlacklist = require("../models/tokenBlacklist.model");

module.exports = {
  login: async (req, res) => {
    try {
      const data = await setJWT(req.body);
      res.send(data);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  },

  refreshToken: async (req, res) => {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(400).send({ error: "Refresh token required." });
    }

    // check blacklist
    const isBlacklisted = await TokenBlacklist.findOne({ token: refreshToken });
    if (isBlacklisted) {
      return res.status(403).send({ error: "Token is blacklisted." });
    }

    jwt.verify(refreshToken, process.env.REFRESH_KEY, async (err, decoded) => {
      if (err) {
        return res.status(403).send({ error: "Invalid refresh token." });
      }

      try {
        const data = await setJWT({ userId: decoded.id }, refreshToken);
        res.send(data);
      } catch (err) {
        res.status(401).send({ error: err.message });
      }
    });
  },

  logout: async (req, res) => {
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).send({ error: "Refresh token is required." });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_KEY);

      // save to blacklist
      await TokenBlacklist.create({
        token: refreshToken,
        expiresAt: new Date(decoded.exp * 1000 * 24 * 7), // JWT expired time
      });

      res.send({ message: "Logged out successfully." });
    } catch (err) {
      res.status(400).send({ error: "Invalid token." });
    }
  },
};
