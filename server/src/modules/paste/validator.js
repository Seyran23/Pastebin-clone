const { param, body } = require("express-validator");

const validateCreatePaste = [
  body("content").isLength({ min: 1 }).withMessage("Content is required"),

  body("category").notEmpty().withMessage("Category cannot be empty"),

  body("exposure")
    .isIn(["public", "private", "unlisted"])
    .withMessage("Invalid exposure value"),

  body("expirationTime").notEmpty().withMessage("Expiration Time is required"),

  body("name").notEmpty().withMessage("Name is required"),
];

const validateComment = [
  body("content").isLength({ min: 1 }).withMessage("Comment cannot be empty"),
];

const validateUUIDParam = [
  param("id").isUUID().withMessage("Invalid ID format, must be a UUID"),
];

const validateLinkWithRegex = [
  param("link")
    .matches(/\b[a-zA-Z0-9]{8,}\b/g)
    .withMessage("Invalid link format")
    .isLength({ max: 8 })
    .withMessage("Invalid link length"),
];

module.exports = {
  validateCreatePaste,
  validateComment,
  validateLinkWithRegex,
  validateUUIDParam,
};
