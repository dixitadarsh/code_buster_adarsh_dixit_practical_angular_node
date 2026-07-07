const upload = require("../config/multer");

exports.productImage = upload.single("image");