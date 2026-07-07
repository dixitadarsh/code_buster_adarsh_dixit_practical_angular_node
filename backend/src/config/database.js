const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
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