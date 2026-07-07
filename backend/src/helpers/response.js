const HTTP = require("../utils/httpStatus");
const messages = require("../utils/messages");

module.exports = (req, res, next) => {
    const sendResponse = (
        statusCode,
        success,
        message,
        data = null,
        pagination = null,
        errors = null
    ) => {
        return res.status(statusCode).json({
            success,
            message,
            data,
            pagination,
            errors,
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
        });
    };

    res.success = (data = null, message = messages.SUCCESS) =>
        sendResponse(HTTP.OK, true, message, data);

    res.created = (data = null, message = messages.CREATED) =>
        sendResponse(HTTP.CREATED, true, message, data);

    res.updated = (data = null, message = messages.UPDATED) =>
        sendResponse(HTTP.OK, true, message, data);

    res.deleted = (message = messages.DELETED) =>
        sendResponse(HTTP.OK, true, message);

    res.paginated = (
        data,
        pagination,
        message = messages.FETCHED
    ) => sendResponse(HTTP.OK, true, message, data, pagination);

    res.badRequest = (message, errors = null) =>
        sendResponse(HTTP.BAD_REQUEST, false, message, null, null, errors);

    res.unauthorized = (message = messages.UNAUTHORIZED) =>
        sendResponse(HTTP.UNAUTHORIZED, false, message);

    res.forbidden = (message = messages.FORBIDDEN) =>
        sendResponse(HTTP.FORBIDDEN, false, message);

    res.notFound = (message) =>
        sendResponse(HTTP.NOT_FOUND, false, message);

    res.conflict = (message) =>
        sendResponse(HTTP.CONFLICT, false, message);

    res.serverError = (message = messages.INTERNAL_SERVER_ERROR) =>
        sendResponse(HTTP.INTERNAL_SERVER_ERROR, false, message);

    next();
};