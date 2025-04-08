const express = require("express");
const router = express.Router();

const handleValidationErrors = require("../../middlewares/validation-error.middleware");
const authMiddleware = require("../auth/middleware");

const {
  getCategories,
  getSyntaxHighlights,
  getExpirationTime,
  getPasteByLink,
  createPaste,
  deletePaste,
  unlockPaste,
  togglePasteLike,
  getLikeStats,
  createComment,
  deleteComment,
} = require("./controller");
const {
  validateUUIDParam,
  validateLinkWithRegex,
  validateCreatePaste,
} = require("./validator");



router.get("/categories", getCategories);
router.get("/expiration-time", getExpirationTime);
router.get("/syntax-highlights", getSyntaxHighlights);
router.get(
  "/like-stats/:id",
  validateUUIDParam,
  handleValidationErrors,
  getLikeStats
);



router.get(
  "/:link",
  authMiddleware,
  validateLinkWithRegex,
  handleValidationErrors,
  getPasteByLink
);

router.post(
  "/create",
  authMiddleware,
  validateCreatePaste,
  handleValidationErrors,
  createPaste
);

router.post("/unlock-paste", unlockPaste);

router.post(
  "/like/:id",
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  togglePasteLike
);
router.post(
  "/comment/:id",
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  createComment
);

router.delete(
  "/:id",
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  deletePaste
);
router.delete(
  "/comment/:id",
  authMiddleware,
  validateUUIDParam,
  handleValidationErrors,
  deleteComment
);

module.exports = router;
