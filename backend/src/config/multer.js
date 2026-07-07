const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const uploadPath = path.join(process.cwd(), "uploads", "products");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadPath);
    },

    filename(req, file, cb) {
        const extension = path.extname(file.originalname);

        cb(null, `${uuidv4()}${extension}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }

    cb(null, true);
};

module.exports = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});