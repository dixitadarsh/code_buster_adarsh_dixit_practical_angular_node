const jwt = require("jsonwebtoken");
const env = require("../config/env");

exports.generateAccessToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN || "15m",
    });
};

exports.generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN || "7d",
    });
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
};