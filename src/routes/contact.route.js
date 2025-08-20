"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const requirePermission = require("../middlewares/requirePermission");
const {
  create,
  readOne,
  readMany,
  update,
  _delete,
  purge,
} = require("../controllers/contact.controller");

// JWT Verification for all routes
router.use(jwtVerification);

router
  .route("/")
  .post(requirePermission("CREATE_CONTACT"), create)
  .get(requirePermission("LIST_CONTACTS"), readMany);

router
  .route("/:id")
  .get(requirePermission("VIEW_CONTACT"), readOne)
  .put(requirePermission("UPDATE_CONTACT"), update)
  .delete(requirePermission("DELETE_CONTACT"), _delete);

router.delete("/purge/:id", requirePermission("PURGE_RECORD"), purge);

module.exports = router;
