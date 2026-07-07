const express = require("express");

const router = express.Router();

const authController = require("./auth.controller");
const authValidation = require("./auth.validation");

const validate = require("../../middleware/validate.middleware");
const authenticate = require("../../middleware/auth.middleware");

// Register
router.post(
    "/register",
    validate(authValidation.register),
    authController.register
);

// Login
router.post(
    "/login",
    validate(authValidation.login),
    authController.login
);

// Refresh Access Token
router.post(
    "/refresh",
    validate(authValidation.refreshToken),
    authController.refreshToken
);

// Logout
router.post(
    "/logout",
    authenticate,
    validate(authValidation.logout),
    authController.logout
);

module.exports = router;