"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const matterController = require("../controllers/matter.controller");
const { multipleFiles } = require("../middlewares/multer");

// JWT Verification for all routes
router.use(jwtVerification);

// CRUD Routes
router
  .route("/")
  .post(requirePermission("CREATE_MATTER"), matterController.create)
  .get(requirePermission("LIST_MATTERS"), matterController.readMany);

// stats
router.get(
  "/stats",
  requirePermission("LIST_MATTERS"),
  matterController.getMatterStats
);

// Admin routes
router.delete(
  "/purge/:id",
  requirePermission("PURGE_RECORD"),
  matterController.purge
);

// Note CRUD Routes
router
  .route("/:matterId/notes")
  .post(
    requirePermission("UPDATE_MATTER"),
    multipleFiles("files", 5),
    matterController.addNote
  );

router
  .route("/:matterId/notes/:noteId")
  .put(
    requirePermission("UPDATE_MATTER"),
    multipleFiles("files", 5),
    matterController.updateNote
  )
  .delete(requirePermission("UPDATE_MATTER"), matterController.deleteNote);

// Financial routes
router.get(
  "/:id/financial-summary",
  requirePermission("VIEW_MATTER"),
  matterController.getFinancialSummary
);

router.put(
  "/:id/update-financials",
  requirePermission("UPDATE_MATTER"),
  matterController.updateFinancials
);

router
  .route("/:id")
  .get(requirePermission("VIEW_MATTER"), matterController.readOne)
  .put(requirePermission("UPDATE_MATTER"), matterController.update)
  .delete(requirePermission("DELETE_MATTER"), matterController._delete);

module.exports = router;
