const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const productUploadPath = path.join(
    process.cwd(),
    "uploads",
    "products"
);

const importUploadPath = path.join(
    process.cwd(),
    "uploads",
    "imports"
);

[
    productUploadPath,
    importUploadPath
].forEach((directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {
            recursive: true,
        });
    }
});

const IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const IMPORT_TYPES = [
    "text/csv",
    "application/csv",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const productStorage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, productUploadPath);

    },

    filename(req, file, cb) {

        cb(
            null,
            `${uuidv4()}${path.extname(file.originalname)}`
        );

    },

});

const importStorage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, importUploadPath);

    },

    filename(req, file, cb) {

        cb(
            null,
            `${uuidv4()}${path.extname(file.originalname)}`
        );

    },

});

const imageUpload = multer({

    storage: productStorage,

    fileFilter(req, file, cb) {

        if (!IMAGE_TYPES.includes(file.mimetype)) {

            return cb(
                new Error(
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
                )
            );

        }

        cb(null, true);

    },

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

});

const bulkUpload = multer({

    storage: importStorage,

    fileFilter(req, file, cb) {

        if (!IMPORT_TYPES.includes(file.mimetype)) {

            return cb(
                new Error(
                    "Only CSV and XLSX files are allowed."
                )
            );

        }

        cb(null, true);

    },

    limits: {
        fileSize: 50 * 1024 * 1024,
    },

});

module.exports = {
    imageUpload,
    bulkUpload,
};