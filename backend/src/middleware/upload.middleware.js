const {
    imageUpload,
    bulkUpload,
} = require("../config/multer");

exports.productImage =
    imageUpload.single("image");

exports.productBulkFile =
    bulkUpload.single("file");