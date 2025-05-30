const router = require("express").Router();
const uploadSinglePDF = require("../middlewares/multer");
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const queryHandler = require("../middlewares/queryHandler");

const {
  uploadDocument,
  getDocument,
  getDocuments,
  deleteDocument,
  updateDocument,
} = require("../controllers/document.controller");

router.post(
  "/",
  jwtVerification,
  requireAuth(["admin"]),
  uploadSinglePDF,
  uploadDocument
);

router.get("/", jwtVerification, queryHandler, getDocuments);

router
  .route("/:id")
  .get(jwtVerification, getDocument)
  .delete(jwtVerification, requireAuth(["admin"]), deleteDocument)
  .put(jwtVerification, requireAuth(["admin"]), updateDocument);

module.exports = router;
