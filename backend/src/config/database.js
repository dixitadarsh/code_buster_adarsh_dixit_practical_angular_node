const { Sequelize } = require("sequelize");
const env = require("../config/env");

const sequelize = new Sequelize(
    env.DB_NAME,
    env.DB_USER,
    env.DB_PASSWORD,
    {
        host: env.DB_HOST,
        port: env.DB_PORT,
        dialect: "postgres",

        logging: false,

        define: {
            timestamps: true,
            paranoid: true,
            freezeTableName: true,
        },

        pool: {
            max: 10,
            min: 0,
            idle: 10000,
            acquire: 30000,
        },
    }
);

module.exports = sequelize;