const router = require("express").Router();
const { singleFile } = require("../middlewares/multer");
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");

const {
  create,
  readMany,
  readOne,
  update,
  _delete,
  purge,
} = require("../controllers/document.controller");

// JWT Verification for all routes
router.use(jwtVerification);

router.post(
  "/",
  requirePermission("CREATE_DOCUMENT"),
  singleFile("file"),
  create
);

router.get("/", requirePermission("LIST_DOCUMENTS"), readMany);

router
  .route("/:id")
  .get(requirePermission("VIEW_DOCUMENT"), readOne)
  .put(requirePermission("UPDATE_DOCUMENT"), update)
  .delete(requirePermission("DELETE_DOCUMENT"), _delete);

router.delete("/purge/:id", requirePermission("PURGE_RECORD"), purge);

module.exports = router;
