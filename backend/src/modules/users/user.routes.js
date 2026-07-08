const express = require("express");

const router = express.Router();

const userController = require("./user.controller");
const userValidation = require("./user.validation");
const authenticate = require("../../middleware/auth.middleware");

const validate = require("../../middleware/validate.middleware");

// GET All Users
router.get(
    "/",
    authenticate,
    userController.findAll
);

// GET User By Unique Id
router.get(
    "/:uniqueId",
    authenticate,
    validate(userValidation.getById),
    userController.findByUniqueId
);

// CREATE User
router.post(
    "/",
    authenticate,
    validate(userValidation.create),
    userController.create
);

// UPDATE User
router.put(
    "/:uniqueId",
    authenticate,
    validate(userValidation.update),
    userController.update
);

// DELETE User
router.delete(
    "/:uniqueId",
    authenticate,
    validate(userValidation.delete),
    userController.delete
);

module.exports = router;