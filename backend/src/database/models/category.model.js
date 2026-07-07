const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
    const Category = sequelize.define(
        "Category",
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

            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [2, 255],
                },
            },
        },
        {
            tableName: "categories",
            timestamps: true,
            paranoid: true,
        }
    );

    return Category;
};