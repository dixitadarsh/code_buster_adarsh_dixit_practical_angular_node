const sequelize = require("../config/database");
const logger = require("../utils/logger");

const connectDatabase = async () => {
    try {
        await sequelize.authenticate();

        logger.success("PostgreSQL Connected Successfully");
    } catch (error) {
        logger.error("Database Connection Failed");
        logger.error(error.message);

        process.exit(1);
    }
};

module.exports = connectDatabase;