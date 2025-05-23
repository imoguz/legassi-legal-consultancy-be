"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const {
  create,
  verify,
  readOne,
  readMany,
  update,
  _delete,
} = require("../controllers/user.controller");

// Public
router.route("/").post(create);
router.route("/verify").get(verify);

// Protected
router.route("/").get(jwtVerification, requireAuth(["admin"]), readMany);
router
  .route("/:id")
  .get(jwtVerification, requireAuth(), readOne)
  .put(jwtVerification, requireAuth(), update)
  .delete(jwtVerification, requireAuth(["admin"]), _delete);

module.exports = router;
