const pinoHttp = require("pino-http");
const logger = require("../config/logger");

module.exports = pinoHttp({
    logger,

    customSuccessMessage(req, res) {
        return `${req.method} ${req.url} ${res.statusCode}`;
    },

    customErrorMessage(req, res, error) {
        return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`;
    },

    serializers: {
        req(req) {
            return {
                requestId: req.requestId,
                method: req.method,
                url: req.url,
                ip: req.ip,
            };
        },

        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
});