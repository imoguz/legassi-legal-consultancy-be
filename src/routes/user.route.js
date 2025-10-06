"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const {
  create,
  verify,
  readOne,
  readMany,
  readAllStaff,
  getNotificationPreferences,
  updateNotificationPreferences,
  update,
  _delete,
  purge,
} = require("../controllers/user.controller");

router.post("/", create);
router.get("/", jwtVerification, requirePermission("LIST_USERS"), readMany);

router.get("/verify", verify);

router.get(
  "/staff",
  jwtVerification,
  requirePermission("LIST_STAFF"),
  readAllStaff
);

router.get(
  "/notification-preferences",
  jwtVerification,
  getNotificationPreferences
);

router.put(
  "/notification-preferences",
  jwtVerification,
  updateNotificationPreferences
);

router
  .route("/:id")
  .get(jwtVerification, requirePermission("VIEW_USER"), readOne)
  .put(jwtVerification, requirePermission("UPDATE_USER"), update)
  .delete(jwtVerification, requirePermission("DELETE_USER"), _delete);

router.delete(
  "/purge/:id",
  jwtVerification,
  requirePermission("PURGE_RECORD"),
  purge
);

module.exports = router;
