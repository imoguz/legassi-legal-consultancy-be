"use strict";

const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/tokenBlacklist.model");

const ACCESS_KEY = process.env.ACCESS_KEY;
const REFRESH_KEY = process.env.REFRESH_KEY;

const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "15d";

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_KEY, { expiresIn: ACCESS_EXPIRES_IN });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_KEY, { expiresIn: REFRESH_EXPIRES_IN });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_KEY);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_KEY);
}

async function blacklistToken(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return;
    const expiresAt = new Date(decoded.exp * 1000);
    await TokenBlacklist.create({ token, expiresAt });
  } catch (err) {
    console.error("blacklistToken error:", err);
  }
}

async function isBlacklisted(token) {
  const found = await TokenBlacklist.findOne({ token });
  return !!found;
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  isBlacklisted,
};
