"use strict";

const User = require("../models/user.model");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  blacklistToken,
  isBlacklisted,
} = require("../services/token.service");
const TokenBlacklist = require("../models/tokenBlacklist.model");
const { sendEmail, resetPasswordTemplate } = require("../helpers/sendEmail");

// Cookie helper
function setRefreshCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  };
  res.cookie("refreshToken", token, cookieOptions);
}

function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", { path: "/" });
}

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required." });
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      if (!user.isVerified) {
        return res.status(403).json({ error: "Email not verified." });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      // Create tokens
      const payload = { id: user._id.toString(), role: user.role };
      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken({ id: user._id.toString() });

      // Set refresh token cookie
      setRefreshCookie(res, refreshToken);

      // User object
      const userSafe = {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profileUrl: user.profileUrl,
        role: user.role,
        position: user.position,
      };

      return res.json({
        accessToken,
        user: userSafe,
      });
    } catch (err) {
      console.error("login error:", err);
      return res.status(500).json({ error: "Something went wrong." });
    }
  },

  me: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user || !user.isActive || !user.isVerified) {
        return res.status(401).json({ error: "User not valid." });
      }

      const userSafe = {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profileUrl: user.profileUrl,
        role: user.role,
        position: user.position,
      };

      return res.json({ user: userSafe });
    } catch (err) {
      console.error("me error:", err);
      return res.status(500).json({ error: "Something went wrong." });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token missing." });
      }

      // Blacklist check
      if (await isBlacklisted(refreshToken)) {
        clearRefreshCookie(res);
        return res.status(403).json({ error: "Refresh token revoked." });
      }

      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (err) {
        clearRefreshCookie(res);
        return res.status(401).json({ error: "Invalid refresh token." });
      }

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive || !user.isVerified) {
        clearRefreshCookie(res);
        return res.status(401).json({ error: "User invalid." });
      }

      // Rotation: blacklist old refresh token
      await blacklistToken(refreshToken);

      const newPayload = { id: user._id.toString(), role: user.role };
      const newAccessToken = signAccessToken(newPayload);
      const newRefreshToken = signRefreshToken({ id: user._id.toString() });

      setRefreshCookie(res, newRefreshToken);

      // Return new access token and user
      const userSafe = {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profileUrl: user.profileUrl,
        role: user.role,
        position: user.position,
      };

      return res.json({
        accessToken: newAccessToken,
        user: userSafe,
      });
    } catch (err) {
      console.error("refreshToken error:", err);
      return res.status(500).json({ error: "Something went wrong." });
    }
  },

  logout: async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required." });
      }

      // Try verify so we can set expiresAt for blacklist
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await TokenBlacklist.create({
          token: refreshToken,
          expiresAt: new Date(decoded.exp * 1000),
        });
      } catch (err) {
        // If invalid token, still clear cookie
      }

      clearRefreshCookie(res);
      return res.json({ message: "Logged out successfully." });
    } catch (err) {
      console.error("logout error:", err);
      return res.status(500).json({ error: "Something went wrong." });
    }
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    try {
      const user = await User.findOne({ email });

      if (user) {
        const token = jwt.sign(
          { id: user._id },
          process.env.RESET_PASSWORD_SECRET,
          {
            expiresIn: "1h",
          }
        );

        const html = resetPasswordTemplate(user, token);

        await sendEmail({
          to: user.email,
          subject: "Reset Your Password",
          html,
        });
      }

      res.json({
        message:
          "If an account with this email exists, a reset link has been sent.",
      });
    } catch (err) {
      console.error("forgotPassword error:", err);
      res.status(500).json({ error: "Something went wrong." });
    }
  },

  resetPassword: async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "Token and new password are required." });
    }

    try {
      const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~\-])[A-Za-z\d!@#$%^&*()_+[\]{};':"\\|,.<>/?`~\-]{8,32}$/;

      if (!passwordRegex.test(password)) {
        throw new Error(
          "Password must be 8-32 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
        );
      }

      user.password = password;
      await user.save();

      res.json({ message: "Password has been reset successfully." });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({ error: "Reset link has expired." });
      }
      console.error("resetPassword error:", err);
      res.status(400).json({ error: "Invalid or expired token." });
    }
  },
};
