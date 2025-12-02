"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const invoiceController = require("../controllers/invoice.controller");

// JWT Verification for all routes
router.use(jwtVerification);

// CRUD Routes
router
  .route("/")
  .post(requirePermission("CREATE_INVOICE"), invoiceController.create)
  .get(requirePermission("LIST_INVOICES"), invoiceController.readMany);

router
  .route("/:id")
  .get(requirePermission("VIEW_INVOICE"), invoiceController.readOne)
  .put(requirePermission("UPDATE_INVOICE"), invoiceController.update);

// Matter-specific invoices
router.get(
  "/matter/:matterId",
  requirePermission("VIEW_MATTER"),
  invoiceController.readByMatter
);

// Invoice actions
router.put(
  "/:id/issue",
  requirePermission("UPDATE_INVOICE"),
  invoiceController.issue
);

router.put(
  "/:id/void",
  requirePermission("UPDATE_INVOICE"),
  invoiceController.void
);

module.exports = router;
