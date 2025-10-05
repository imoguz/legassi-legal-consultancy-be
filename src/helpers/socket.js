"use strict";

const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");

class SocketManager {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(",")
          : ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.userSockets = new Map();
    this.setupMiddleware();
    this.setupConnectionHandling();
  }

  setupMiddleware() {
    this.io.use((socket, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        // Remove "Bearer " prefix if present
        const actualToken = token.startsWith("Bearer ")
          ? token.slice(7)
          : token;

        const decoded = jwt.verify(
          actualToken,
          process.env.JWT_SECRET || "your-fallback-secret"
        );
        socket.userId = decoded.id;
        next();
      } catch (err) {
        console.error("Socket authentication error:", err.message);
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  setupConnectionHandling() {
    this.io.on("connection", (socket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);

      // Set user to socket map
      if (!this.userSockets.has(socket.userId)) {
        this.userSockets.set(socket.userId, new Set());
      }
      this.userSockets.get(socket.userId).add(socket.id);

      // Join user room
      socket.join(`user:${socket.userId}`);

      // Notification events
      socket.on("mark-notification-read", async (data) => {
        await this.handleMarkAsRead(socket, data);
      });

      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  emitToUser(userId, event, data) {
    try {
      if (this.userSockets.has(userId)) {
        this.io.to(`user:${userId}`).emit(event, data);
        console.log(`Event ${event} emitted to user ${userId}`);
        return true;
      }
      console.log(`User ${userId} not connected, event ${event} not emitted`);
      return false;
    } catch (error) {
      console.error("Error emitting to user:", error);
      return false;
    }
  }

  async handleMarkAsRead(socket, data) {
    try {
      const Notification = require("../models/notification.model");
      await Notification.findOneAndUpdate(
        { _id: data.notificationId, user: socket.userId },
        { isRead: true }
      );

      const unreadCount = await Notification.countDocuments({
        user: socket.userId,
        isRead: false,
      });

      this.emitToUser(socket.userId, "notification-read", {
        notificationId: data.notificationId,
        unreadCount,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  handleDisconnect(socket) {
    if (this.userSockets.has(socket.userId)) {
      const userSockets = this.userSockets.get(socket.userId);
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        this.userSockets.delete(socket.userId);
      }
    }
    console.log(`User ${socket.userId} disconnected`);
  }

  // Get connected users count (for monitoring)
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  // Get all connected user IDs
  getConnectedUserIds() {
    return Array.from(this.userSockets.keys());
  }
}

let socketManager = null;

module.exports = {
  initialize: (server) => {
    if (!socketManager) {
      socketManager = new SocketManager(server);
    }
    return socketManager;
  },

  getIO: () => {
    if (!socketManager) {
      throw new Error(
        "SocketManager not initialized. Call initialize() first."
      );
    }
    return socketManager.io;
  },

  emitToUser: (userId, event, data) => {
    if (!socketManager) {
      console.error("SocketManager not initialized");
      return false;
    }
    return socketManager.emitToUser(userId, event, data);
  },

  getConnectedUsersCount: () => {
    return socketManager ? socketManager.getConnectedUsersCount() : 0;
  },
};
