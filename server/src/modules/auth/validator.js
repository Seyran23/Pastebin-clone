const { body, param } = require("express-validator");

const validateSignup = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 1, max: 20 })
    .withMessage("Username must be between 1 and 12 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 8 and 20 characters"),
];

const validateLogin = [
  body("username").notEmpty().withMessage("Username is required"),

  body("password").notEmpty().withMessage("Password is required"),
];


const validateUUIDParam = [
  param("activationLink")
    .isUUID()
    .withMessage("Invalid Link format, must be a UUID"),
];


module.exports = { validateSignup, validateLogin, validateUUIDParam };
