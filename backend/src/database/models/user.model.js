const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            uniqueId: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                defaultValue: () => uuidv4(),
            },

            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },

            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            refreshToken: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        },
        {
            tableName: "users",
            timestamps: true,
            paranoid: true,
        }
    );

    return User;
};