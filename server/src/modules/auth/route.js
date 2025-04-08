/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */

const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  refresh,
  activateProfile,
} = require("./controller");
const {
  validateSignup,
  validateLogin,
  validateUUIDParam,
} = require("./validator");
const handleValidationErrors = require("../../middlewares/validation-error.middleware");

router.post("/signup", validateSignup, handleValidationErrors, signup);

router.post("/login", validateLogin, handleValidationErrors, login);

router.post("/logout", logout);

router.get("/refresh", refresh);

router.get(
  "/verify-email/:activationLink",
  validateUUIDParam,
  handleValidationErrors,
  activateProfile
);

module.exports = router;
