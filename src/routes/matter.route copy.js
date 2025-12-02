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
} = require("../controllers/matter.controller");

// JWT Verification for all routes
router.use(jwtVerification);

router
  .route("/")
  .post(requirePermission("CREATE_MATTER"), create)
  .get(requirePermission("LIST_MATTERS"), readMany);

router
  .route("/:id")
  .get(requirePermission("VIEW_MATTER"), readOne)
  .put(requirePermission("UPDATE_MATTER"), update)
  .delete(requirePermission("DELETE_MATTER"), _delete);

router.delete("/purge/:id", requirePermission("PURGE_RECORD"), purge);

module.exports = router;
