const categoryService = require("./category.service");

const asyncHandler = require("../../utils/asyncHandler");
const messages = require("../../utils/messages");


exports.create = asyncHandler(async (req, res) => {

    const category =
        await categoryService.create(req.body);


    return res.created(
        category,
        messages.CATEGORY_CREATED
    );

});



exports.findAll = asyncHandler(async (req, res) => {

    const result =
        await categoryService.findAll(req.query);


    const {
        count,
        rows
    } = result;


    const page = Number(req.query.page || 1);

    const limit = Number(req.query.limit || 10);


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

    const category =
        await categoryService.findByUniqueId(
            req.params.uniqueId
        );


    return res.success(
        category,
        messages.FETCHED
    );

});



exports.update = asyncHandler(async (req, res) => {

    const category =
        await categoryService.update(
            req.params.uniqueId,
            req.body
        );


    return res.updated(
        category,
        messages.CATEGORY_UPDATED
    );

});



exports.delete = asyncHandler(async (req, res) => {


    await categoryService.delete(
        req.params.uniqueId
    );


    return res.deleted(
        messages.CATEGORY_DELETED
    );

});