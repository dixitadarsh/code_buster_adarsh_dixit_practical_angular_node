const userRepository = require("./user.repository");

const apiError = require("../../utils/apiError");
const HTTP = require("../../utils/httpStatus");
const messages = require("../../utils/messages");
const { hashPassword } = require("../../utils/bcrypt");

exports.create = async (payload) => {
    const { email, password } = payload;

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
        throw apiError(HTTP.CONFLICT, messages.EMAIL_EXISTS);
    }

    const hashedPassword = await hashPassword(password, 10);

    const user = await userRepository.create({
        ...payload,
        password: hashedPassword,
    });

    const userResponse = user.toJSON();

    delete userResponse.password;
    delete userResponse.refreshToken;

    return userResponse;
};

exports.findAll = async (query = {}) => {

    const {
        page = 1,
        limit = 10
    } = query;

    

    return userRepository.findAll({
        page,
        limit
    });

};

exports.findByUniqueId = async (uniqueId) => {
    const user = await userRepository.findByUniqueId(uniqueId);

    if (!user) {
        throw apiError(HTTP.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    const userResponse = user.toJSON();

    delete userResponse.password;
    delete userResponse.refreshToken;

    return userResponse;
};

exports.update = async (uniqueId, payload) => {
    const user = await userRepository.findByUniqueId(uniqueId);

    if (!user) {
        throw apiError(HTTP.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (payload.password) {
        payload.password = await hashPassword(payload.password, 10);
    }

    if (payload.email) {

        const existingUser =
            await userRepository.findByEmail(payload.email);


        if (existingUser && existingUser.uniqueId !== uniqueId) {
            throw apiError(
                HTTP.CONFLICT,
                messages.EMAIL_EXISTS
            );
        }

    }

    const updatedUser = await userRepository.update(uniqueId, payload);

    const userResponse = user.toJSON();

    delete userResponse.password;
    delete userResponse.refreshToken;

    return userResponse;
};

exports.delete = async (uniqueId) => {
    const user = await userRepository.findByUniqueId(uniqueId);

    if (!user) {
        throw apiError(HTTP.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    await userRepository.delete(uniqueId);

    return;
};