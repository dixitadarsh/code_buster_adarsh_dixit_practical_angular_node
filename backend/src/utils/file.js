const fs = require("fs");
const path = require("path");

exports.deleteFile = (relativePath) => {

    if (!relativePath) {
        return;
    }

    const absolutePath = path.join(
        process.cwd(),
        relativePath.replace(/^\//, "")
    );

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }

};