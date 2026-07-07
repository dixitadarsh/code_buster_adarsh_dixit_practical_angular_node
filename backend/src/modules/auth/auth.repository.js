const { User } = require("../../database/models");

exports.findByEmail = async (email) => {
    return User.findOne({
        where: { email },
    });
};

exports.create = async (payload) => {
    return User.create(payload);
};

exports.findByUniqueId = async (uniqueId) => {
    return User.findOne({
        where: { uniqueId },
    });
};

exports.findByRefreshToken = async (refreshToken) => {
    return User.findOne({
        where: { refreshToken },
    });
};

exports.updateRefreshToken = async (uniqueId, refreshToken) => {
    await User.update(
        { refreshToken },
        {
            where: { uniqueId },
        }
    );

    return true;
};

exports.clearRefreshToken = async (uniqueId) => {
    await User.update(
        {
            refreshToken: null,
        },
        {
            where: { uniqueId },
        }
    );

    return true;
};