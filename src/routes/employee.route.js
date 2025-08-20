"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const {
  create,
  readMany,
  readOne,
  update,
  _delete,
  purge,
} = require("../controllers/employee.controller");
const requirePermission = require("../middlewares/requirePermission");

// JWT Verification for all routes
router.use(jwtVerification);

router
  .route("/")
  .post(requirePermission("CREATE_EMPLOYEE"), create)
  .get(requirePermission("LIST_EMPLOYEES"), readMany);

router
  .route("/:id")
  .get(requirePermission("VIEW_EMPLOYEE"), readOne)
  .put(requirePermission("UPDATE_EMPLOYEE"), update)
  .delete(requirePermission("DELETE_EMPLOYEE"), _delete);

router.delete("/purge/:id", requirePermission("PURGE_RECORD"), purge);

module.exports = router;
