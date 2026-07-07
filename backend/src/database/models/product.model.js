const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
    const Product = sequelize.define(
        "Product",
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

            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "categories",
                    key: "id",
                },
            },

            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 255],
                },
            },

            imagePath: {
                type: DataTypes.STRING,
                allowNull: true
            },

            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                validate: {
                    min: 0,
                },
            },
        },
        {
            tableName: "products",
            timestamps: true,
            paranoid: true,
        }
    );

    return Product;
};