const router = require("express").Router();
const uploadSinglePDF = require("../middlewares/multer");
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const docCtrl = require("../controllers/document.controller");

router.post(
  "/",
  jwtVerification,
  requireAuth(["admin"]),
  uploadSinglePDF,
  docCtrl.uploadDocument
);

router.get("/", jwtVerification, docCtrl.getDocuments);

router.delete(
  "/:id",
  jwtVerification,
  requireAuth(["admin"]),
  docCtrl.deleteDocument
);

router.put(
  "/:id",
  jwtVerification,
  requireAuth(["admin"]),
  docCtrl.updateDocument
);

module.exports = router;
