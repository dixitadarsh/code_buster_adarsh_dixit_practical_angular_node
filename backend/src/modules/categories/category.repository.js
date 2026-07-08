const { Op } = require("sequelize");
const { Category } = require("../../database/models");


exports.create = async (payload) => {

    return Category.create(payload);

};


exports.findAll = async ({
    page = 1,
    limit = 10,
    search = ""
} = {}) => {


    page = Math.max(1, Number(page) || 1);

    limit = Math.max(1, Number(limit) || 10);

    const offset = (page - 1) * limit;


    const where = {};


    if (search) {
        where.name = {
            [Op.like]: `%${search}%`
        };
    }


    return Category.findAndCountAll({

        where,

        limit,

        offset,

        order: [
            ["createdAt", "DESC"]
        ]

    });

};


exports.findByUniqueId = async (uniqueId) => {


    return Category.findOne({

        where: {
            uniqueId
        }

    });


};


exports.update = async (uniqueId, payload) => {


    await Category.update(

        payload,

        {
            where: {
                uniqueId
            }
        }

    );


    return exports.findByUniqueId(uniqueId);


};


exports.delete = async (uniqueId) => {


    return Category.destroy({

        where: {
            uniqueId
        }

    });


};

exports.findByName = async (name) => {

    return Category.findOne({

        where: {
            name
        }

    });

};