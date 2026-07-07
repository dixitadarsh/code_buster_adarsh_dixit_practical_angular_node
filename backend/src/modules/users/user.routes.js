const express = require("express");

const router = express.Router();

const userController = require("./user.controller");
const userValidation = require("./user.validation");

const validate = require("../../middleware/validate.middleware");

// GET All Users
router.get(
    "/",
    userController.findAll
);

// GET User By Unique Id
router.get(
    "/:uniqueId",
    validate(userValidation.getById),
    userController.findByUniqueId
);

// CREATE User
router.post(
    "/",
    validate(userValidation.create),
    userController.create
);

// UPDATE User
router.put(
    "/:uniqueId",
    validate(userValidation.update),
    userController.update
);

// DELETE User
router.delete(
    "/:uniqueId",
    validate(userValidation.delete),
    userController.delete
);

module.exports = router;