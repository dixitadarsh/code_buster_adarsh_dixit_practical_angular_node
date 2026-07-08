const { User } = require("../../database/models");

exports.create = async (payload) => {
    return User.create(payload);
};

exports.findByEmail = async (email) => {
    return User.findOne({
        where: {
            email,
            deletedAt: null
        }
    });
};

exports.findByUniqueId = async (uniqueId) => {
    return User.findOne({
        where: {
            uniqueId,
            deletedAt: null
        },
        attributes: {
            exclude: [
                "password",
                "refreshToken"
            ]
        }
    });
};

exports.findAll = async ({
    page = 1,
    limit = 10
} = {}) => {

    page = Math.max(1, Number(page) || 1);

    limit = Math.max(1, Number(limit) || 10);
    const offset = (page - 1) * limit;
    return User.findAndCountAll({

        limit,

        offset,

        attributes: {
            exclude: [
                "password",
                "refreshToken"
            ]
        },

        order: [
            ["createdAt", "DESC"]
        ]

    });

};

exports.update = async (uniqueId, payload) => {
    await User.update(payload, {
        where: { uniqueId },
    });

    return exports.findByUniqueId(uniqueId);
};

exports.delete = async (uniqueId) => {
    return User.destroy({
        where: { uniqueId },
    });
};