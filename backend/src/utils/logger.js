const logger = require("../config/logger");

module.exports = {

    info(message) {
        logger.info(message);
    },

    success(message) {
        logger.info(`${message}`);
    },

    warning(message) {
        logger.warn(`${message}`);
    },

    error(error) {
        logger.error(error);
    }

}