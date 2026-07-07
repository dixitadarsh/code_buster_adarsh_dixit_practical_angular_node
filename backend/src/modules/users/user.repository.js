const { User } = require("../../database/models");

exports.create = async (payload) => {
    return User.create(payload);
};

exports.findByEmail = async (email) => {
    return User.findOne({
        where: { email },
    });
};

exports.findByUniqueId = async (uniqueId) => {
    return User.findOne({
        where: { uniqueId },
    });
};

exports.findAll = async () => {
    return User.findAll({
        attributes: {
            exclude: ["password"],
        },
        order: [["createdAt", "DESC"]],
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