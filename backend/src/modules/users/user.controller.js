const userService = require("./user.service");

const asyncHandler = require("../../utils/asyncHandler");
const messages = require("../../utils/messages");

exports.create = asyncHandler(async (req, res) => {
    const user = await userService.create(req.body);

    return res.created(user, messages.USER_CREATED);
});

exports.findAll = asyncHandler(async (req, res) => {
    const users = await userService.findAll();

    return res.success(users, messages.FETCHED);
});

exports.findByUniqueId = asyncHandler(async (req, res) => {
    const user = await userService.findByUniqueId(req.params.uniqueId);

    return res.success(user, messages.FETCHED);
});

exports.update = asyncHandler(async (req, res) => {
    const user = await userService.update(
        req.params.uniqueId,
        req.body
    );

    return res.updated(user, messages.USER_UPDATED);
});

exports.delete = asyncHandler(async (req, res) => {
    await userService.delete(req.params.uniqueId);

    return res.deleted(messages.USER_DELETED);
});