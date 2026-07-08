const { Op } = require("sequelize");
const { Product, Category } = require("../../database/models");

exports.create = async (payload) => {
    return Product.create(payload);
};

exports.findAll = async ({
    page = 1,
    limit = 10,
    search = "",
    categoryId = null,
    sortOrder = "DESC",
} = {}) => {

    page = Math.max(1, Number(page) || 1);

    limit = Math.max(1, Number(limit) || 10);

    const offset = (page - 1) * limit;

    const where = {};

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (search) {

        where[Op.or] = [
            {
                name: {
                    [Op.iLike]: `%${search}%`,
                },
            },
            {
                "$category.name$": {
                    [Op.iLike]: `%${search}%`,
                },
            },
        ];

    }

    return Product.findAndCountAll({

        where,

        include: [
            {
                model: Category,
                as: "category",
                attributes: [
                    "id",
                    "uniqueId",
                    "name",
                ],
            },
        ],

        limit,
        offset,
        subQuery: false,
        order: [
            [
                "price",
                sortOrder.toUpperCase() === "ASC"
                    ? "ASC"
                    : "DESC",
            ],
        ],

        distinct: true,

    });

};

exports.findByUniqueId = async (uniqueId) => {

    return Product.findOne({

        where: {
            uniqueId,
        },

        include: [
            {
                model: Category,
                as: "category",
                attributes: [
                    "id",
                    "uniqueId",
                    "name",
                ],
            },
        ],

    });

};

exports.findByName = async (name) => {

    return Product.findOne({

        where: {
            name: {
                [Op.iLike]: name,
            },
        },

    });

};

exports.update = async (uniqueId, payload) => {

    const [updated] = await Product.update(payload, {
        where: {
            uniqueId,
        },
    });

    if (!updated) {
        return null;
    }

    return exports.findByUniqueId(uniqueId);

};

exports.delete = async (uniqueId) => {

    return Product.destroy({

        where: {
            uniqueId,
        },

    });

};

exports.findByCategoryByUniqueId = async (uniqueId) => {


    return Category.findOne({

        where: {
            uniqueId
        }

    });


};

exports.findCategoryById = async (id) => {

    return Category.findOne({

        where: {
            id,
        },

    });

};

exports.findCategoryByName = async (name) => {

    return Category.findOne({

        where: {
            name: {
                [Op.iLike]: name,
            },
        },

    });

};

exports.bulkCreate = async (products) => {

    return Product.bulkCreate(products, {

        validate: true,

        returning: false,

    });

};

exports.findAllForExport = async ({
    search = "",
    categoryId = null,
    sortOrder = "DESC",
} = {}) => {

    const where = {};

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (search) {

        where[Op.or] = [
            {
                name: {
                    [Op.iLike]: `%${search}%`,
                },
            },
            {
                "$category.name$": {
                    [Op.iLike]: `%${search}%`,
                },
            },
        ];

    }

    return Product.findAll({

        where,

        include: [
            {
                model: Category,
                as: "category",
                attributes: [
                    "name",
                    "uniqueId",
                ],
            },
        ],

        order: [
            [
                "price",
                sortOrder.toUpperCase() === "ASC"
                    ? "ASC"
                    : "DESC",
            ],
        ],

    });

};

exports.findAllCategories = async () => {

    return Category.findAll({

        attributes: [
            "id",
            "name"
        ]

    });

};

exports.findAllProductNames = async () => {

    return Product.findAll({

        attributes: [
            "name"
        ]

    });

};