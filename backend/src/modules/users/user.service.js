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

    user.password = undefined;

    return user;
};

exports.findAll = async () => {
    return await userRepository.findAll();
};

exports.findByUniqueId = async (uniqueId) => {
    const user = await userRepository.findByUniqueId(uniqueId);

    if (!user) {
        throw apiError(HTTP.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    user.password = undefined;

    return user;
};

exports.update = async (uniqueId, payload) => {
    const user = await userRepository.findByUniqueId(uniqueId);

    if (!user) {
        throw apiError(HTTP.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    if (payload.password) {
        payload.password = await hashPassword(payload.password, 10);
    }

    const updatedUser = await userRepository.update(uniqueId, payload);

    updatedUser.password = undefined;

    return updatedUser;
};

exports.delete = async (uniqueId) => {
    const user = await userRepository.findByUniqueId(uniqueId);

    if (!user) {
        throw apiError(HTTP.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    await userRepository.delete(uniqueId);

    return;
};