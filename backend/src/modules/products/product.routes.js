const express = require("express");

const router = express.Router();

const productController = require("./product.controller");
const productValidation = require("./product.validation");

const authenticate = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const uploadMiddleware = require("../../middleware/upload.middleware");

router.get(
    "/",
    authenticate,
    validate(productValidation.findAll),
    productController.findAll
);

router.post(
    "/",
    authenticate,
    uploadMiddleware.productImage,
    validate(productValidation.create),
    productController.create
);

router.post(
    "/bulk-upload",
    authenticate,
    uploadMiddleware.productBulkFile,
    validate(productValidation.bulkUpload),
    productController.bulkUpload
);

router.get(
    "/export/csv",
    authenticate,
    validate(productValidation.exportCsv),
    productController.exportCsv
);

router.get(
    "/export/xlsx",
    authenticate,
    validate(productValidation.exportXlsx),
    productController.exportXlsx
);

router.get(
    "/:uniqueId",
    authenticate,
    validate(productValidation.getById),
    productController.findByUniqueId
);

router.put(
    "/:uniqueId",
    authenticate,
    uploadMiddleware.productImage,
    validate(productValidation.update),
    productController.update
);

router.delete(
    "/:uniqueId",
    authenticate,
    validate(productValidation.delete),
    productController.delete
);

module.exports = router;