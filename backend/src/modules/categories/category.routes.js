const express = require("express");

const router = express.Router();

const categoryController = require("./category.controller");
const categoryValidation = require("./category.validation");

const validate = require("../../middleware/validate.middleware");
const authenticate = require("../../middleware/auth.middleware");


// GET All Categories (Public)
router.get(
    "/",
    authenticate,
    categoryController.findAll
);


// GET Category By Unique Id (Public)
router.get(
    "/:uniqueId",
    authenticate,
    validate(categoryValidation.getById),
    categoryController.findByUniqueId
);


// CREATE Category (Authenticated)
router.post(
    "/",
    authenticate,
    validate(categoryValidation.create),
    categoryController.create
);


// UPDATE Category (Authenticated)
router.put(
    "/:uniqueId",
    authenticate,
    validate(categoryValidation.update),
    categoryController.update
);


// DELETE Category (Authenticated)
router.delete(
    "/:uniqueId",
    authenticate,
    validate(categoryValidation.delete),
    categoryController.delete
);


module.exports = router;