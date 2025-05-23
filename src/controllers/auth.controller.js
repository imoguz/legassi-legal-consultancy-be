"use strict";

const jwt = require("jsonwebtoken");
const setJWT = require("../helpers/setJWT");

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

    jwt.verify(refreshToken, process.env.REFRESH_KEY, async (err, decoded) => {
      if (err) {
        res.status(403).send({ error: "Invalid refresh token." });
      }

      try {
        const data = await setJWT({ userId: decoded.id }, refreshToken);
        res.send(data);
      } catch (err) {
        res.status(401).send({ error: err.message });
      }
    });
  },

  logout: (req, res) => {
    res.send("To exit, simply delete the token on the client.");
  },
};
