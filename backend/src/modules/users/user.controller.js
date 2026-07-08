const userService = require("./user.service");

const asyncHandler = require("../../utils/asyncHandler");
const messages = require("../../utils/messages");

exports.create = asyncHandler(async (req, res) => {
    const user = await userService.create(req.body);

    return res.created(user, messages.USER_CREATED);
});

exports.findAll = asyncHandler(async (req, res) => {
    const users = await userService.findAll(req.query);

    const {
        count,
        rows,
    } = users;

    const page =
        Number(req.query.page || 1);

    const limit =
        Number(req.query.limit || 10);

    const totalPages =
        Math.ceil(count / limit);

    return res.paginated(
        rows,
        {
            page,
            limit,
            totalItems: count,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    );
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