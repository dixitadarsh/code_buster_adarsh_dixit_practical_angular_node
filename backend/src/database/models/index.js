const sequelize = require("../../config/database");

const User = require("./user.model")(sequelize);
const Category = require("./category.model")(sequelize);
const Product = require("./product.model")(sequelize);

// Associations
Category.hasMany(Product, {
    foreignKey: "categoryId",
    as: "products",
});

Product.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category",
});

module.exports = {
    sequelize,
    User,
    Category,
    Product,
};