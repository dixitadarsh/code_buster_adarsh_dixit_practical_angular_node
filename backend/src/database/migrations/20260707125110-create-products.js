module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      uniqueId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },

      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "categories",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      imagePath: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP"
        ),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP"
        ),
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });


    await queryInterface.addIndex(
      "products",
      ["categoryId"]
    );

    await queryInterface.addIndex(
      "products",
      ["price"]
    );

    await queryInterface.addIndex(
      "products",
      ["name"]
    );
  },


  async down(queryInterface) {
    await queryInterface.dropTable("products");
  },
};