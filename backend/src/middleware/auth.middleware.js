const jwt = require("jsonwebtoken");

const apiError = require("../utils/apiError");
const HTTP = require("../utils/httpStatus");
const messages = require("../utils/messages");
const env = require("../config/env");

const { User } = require("../database/models");

module.exports = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (!token || !token.startsWith("Bearer ")) {
            return next(
                apiError(
                    HTTP.UNAUTHORIZED,
                    messages.TOKEN_REQUIRED
                )
            );
        }

        token = token.split(" ")[1];

        const decoded = jwt.verify(
            token,
            env.JWT_SECRET
        );

        const user = await User.findOne({
            where: {
                uniqueId: decoded.uniqueId
            }
        });

        if (!user) {
            return next(
                apiError(
                    HTTP.UNAUTHORIZED,
                    messages.UNAUTHORIZED
                )
            );
        }

        req.user = user;

        next();
    } catch (error) {
        return next(
            apiError(
                HTTP.UNAUTHORIZED,
                messages.INVALID_TOKEN
            )
        );
    }
};