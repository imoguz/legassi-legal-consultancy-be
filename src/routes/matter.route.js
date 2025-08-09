"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const {
  create,
  readMany,
  readOne,
  update,
  _delete,
} = require("../controllers/matter.controller");

// JWT Verification for all routes
router.use(jwtVerification);

// Lawyer & Admin: create & list
router
  .route("/")
  .post(requireAuth(["lawyer", "admin"]), create)
  .get(requireAuth(["lawyer", "admin"]), readMany);

// Detail, update, delete
router
  .route("/:id")
  .get(requireAuth(["lawyer", "admin"]), readOne)
  .put(requireAuth(["lawyer", "admin"]), update)
  .delete(requireAuth(["lawyer", "admin"]), _delete);

module.exports = router;
