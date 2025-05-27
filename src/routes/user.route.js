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

router
  .route("/")
  .post(create)
  .get(jwtVerification, requireAuth(["admin"]), readMany);

router.get("/verify", verify);

router
  .route("/:id")
  .get(jwtVerification, requireAuth(), readOne)
  .put(jwtVerification, requireAuth(), update)
  .delete(jwtVerification, requireAuth(["admin"]), _delete);

module.exports = router;
