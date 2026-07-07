const logger = require("../utils/logger");
const HTTP = require("../utils/httpStatus");
const messages = require("../utils/messages");
const env = require("../config/env");

module.exports = (err, req, res, next) => {
    logger.error(err);

    const statusCode = err.statusCode || HTTP.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
        success: false,
        message: err.message || messages.INTERNAL_SERVER_ERROR,
        errors: err.errors || null,
        timestamp: new Date().toISOString(),
        ...(env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};