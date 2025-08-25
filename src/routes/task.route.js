const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requirePermission = require("../middlewares/requirePermission");
const {
  create,
  readMany,
  readOne,
  update,
  _delete,
  purge,
  getTasksByMatter,
} = require("../controllers/task.controller");

// JWT Verification for all routes
router.use(jwtVerification);

router
  .route("/")
  .post(requirePermission("CREATE_TASK"), create)
  .get(requirePermission("LIST_TASKS"), readMany);

router
  .route("/:id")
  .get(requirePermission("VIEW_TASK"), readOne)
  .put(requirePermission("UPDATE_TASK"), update)
  .delete(requirePermission("DELETE_TASK"), _delete);

router.delete("/purge/:id", requirePermission("PURGE_RECORD"), purge);

router.get("/matter/list", requirePermission("LIST_MATTERS"), getTasksByMatter);

module.exports = router;
