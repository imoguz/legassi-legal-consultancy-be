"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const {
  create,
  readMany,
  readOne,
  update,
  _delete,
  purge,
  getEventsByMatter,
  getEventsByUser,
} = require("../controllers/calendarEvent.controller");

// JWT Verification for all routes
router.use(jwtVerification);

router
  .route("/")
  .post(requirePermission("CREATE_CALENDAR_EVENT"), create)
  .get(requirePermission("LIST_CALENDAR_EVENTS"), readMany);

router
  .route("/:id")
  .get(requirePermission("VIEW_CALENDAR_EVENT"), readOne)
  .put(requirePermission("UPDATE_CALENDAR_EVENT"), update)
  .delete(requirePermission("DELETE_CALENDAR_EVENT"), _delete);

router.delete("/purge/:id", requirePermission("PURGE_RECORD"), purge);

router.get(
  "/matter/:matterId",
  requirePermission("LIST_CALENDAR_EVENTS"),
  getEventsByMatter
);

router.get(
  "/user/:userId",
  requirePermission("LIST_CALENDAR_EVENTS"),
  getEventsByUser
);

module.exports = router;
