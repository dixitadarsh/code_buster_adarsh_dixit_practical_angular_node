const authRepository = require("./auth.repository");

const apiError = require("../../utils/apiError");
const HTTP = require("../../utils/httpStatus");
const messages = require("../../utils/messages");

const {
    hashPassword,
    comparePassword,
} = require("../../utils/bcrypt");

const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require("../../utils/jwt");

exports.register = async (payload) => {
    const { email, password } = payload;

    const existingUser = await authRepository.findByEmail(email);

    if (existingUser) {
        throw apiError(HTTP.CONFLICT, messages.EMAIL_EXISTS);
    }

    const hashedPassword = await hashPassword(password);

    const user = await authRepository.create({
        email,
        password: hashedPassword,
    });

    const tokenPayload = {
        uniqueId: user.uniqueId,
        email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await authRepository.updateRefreshToken(
        user.uniqueId,
        refreshToken
    );

    return {
        user: {
            uniqueId: user.uniqueId,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
};

exports.login = async ({ email, password }) => {
    const user = await authRepository.findByEmail(email);

    if (!user) {
        throw apiError(
            HTTP.UNAUTHORIZED,
            messages.INVALID_CREDENTIALS
        );
    }

    const isPasswordMatched = await comparePassword(
        password,
        user.password
    );

    if (!isPasswordMatched) {
        throw apiError(
            HTTP.UNAUTHORIZED,
            messages.INVALID_CREDENTIALS
        );
    }

    const tokenPayload = {
        uniqueId: user.uniqueId,
        email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await authRepository.updateRefreshToken(
        user.uniqueId,
        refreshToken
    );

    return {
        user: {
            uniqueId: user.uniqueId,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
};

exports.refreshToken = async (refreshToken) => {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await authRepository.findByUniqueId(decoded.uniqueId);

    if (!user || user.refreshToken !== refreshToken) {
        throw apiError(
            HTTP.UNAUTHORIZED,
            messages.INVALID_TOKEN
        );
    }

    const accessToken = generateAccessToken({
        uniqueId: user.uniqueId,
        email: user.email,
    });

    return {
        accessToken,
    };
};

exports.logout = async (uniqueId) => {
    await authRepository.clearRefreshToken(uniqueId);

    return true;
};