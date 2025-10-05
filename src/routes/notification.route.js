"use strict";

const router = require("express").Router();
const notificationController = require("../controllers/notification.controller");
const jwtVerification = require("../middlewares/jwt.verification");

router.use(jwtVerification);

router.get("/", notificationController.listUserNotifications);
router.get("/stats", notificationController.getNotificationStats);
router.get("/:id", notificationController.getNotificationById);

router.put("/:id/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);

router.delete("/:id", notificationController.deleteNotification);

// Admin only routes
router.delete("/admin/cleanup", notificationController.cleanupNotifications);

module.exports = router;
