"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const paymentController = require("../controllers/payment.controller");

// JWT Verification for all routes
router.use(jwtVerification);

// CRUD Routes
router
  .route("/")
  .post(requirePermission("CREATE_PAYMENT"), paymentController.create)
  .get(requirePermission("LIST_PAYMENTS"), paymentController.readMany);

router
  .route("/:id")
  .get(requirePermission("VIEW_PAYMENT"), paymentController.readOne)
  .delete(requirePermission("DELETE_PAYMENT"), paymentController.delete);

// Matter-specific payments
router.get(
  "/matter/:matterId",
  requirePermission("VIEW_MATTER"),
  paymentController.readByMatter
);

// Invoice-specific payments
router.get(
  "/invoice/:invoiceId",
  requirePermission("VIEW_INVOICE"),
  paymentController.readByInvoice
);

module.exports = router;
