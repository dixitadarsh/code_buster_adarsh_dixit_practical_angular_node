const logger = require("../utils/logger");
const sequelize = require("../config/database");

// Load Models & Associations
require("./models");

const connectDatabase = async () => {
    try {
        await sequelize.authenticate();

        logger.info("Database connected successfully.");

        // Development only
        // await sequelize.sync({
        //     alter: false,
        //     force: false,
        // });

        logger.info("Database synchronized successfully.");
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};

module.exports = connectDatabase;