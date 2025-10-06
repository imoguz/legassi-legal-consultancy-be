"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const {
  listUserNotifications,
  getNotificationStats,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupNotifications,
} = require("../controllers/notification.controller");

router.use(jwtVerification);

router.get("/", requirePermission("LIST_NOTIFICATIONS"), listUserNotifications);
router.get(
  "/stats",
  requirePermission("VIEW_NOTIFICATION"),
  getNotificationStats
);
router.get("/:id", requirePermission("VIEW_NOTIFICATION"), getNotificationById);

router.put("/:id/read", requirePermission("UPDATE_NOTIFICATION"), markAsRead);
router.put(
  "/read-all",
  requirePermission("UPDATE_NOTIFICATION"),
  markAllAsRead
);

router.delete(
  "/:id",
  requirePermission("DELETE_NOTIFICATION"),
  deleteNotification
);

// Admin only routes
router.delete(
  "/admin/cleanup",
  requirePermission("CLEANUP_NOTIFICATIONS"),
  cleanupNotifications
);

module.exports = router;
