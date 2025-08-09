"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const {
  create,
  readOne,
  readMany,
  update,
  _delete,
} = require("../controllers/contact.controller");

router
  .route("/")
  .post(jwtVerification, requireAuth(), create)
  .get(jwtVerification, requireAuth(), readMany);

router
  .route("/:id")
  .get(jwtVerification, requireAuth(), readOne)
  .put(jwtVerification, requireAuth(), update)
  .delete(jwtVerification, requireAuth(["admin"]), _delete);

module.exports = router;
