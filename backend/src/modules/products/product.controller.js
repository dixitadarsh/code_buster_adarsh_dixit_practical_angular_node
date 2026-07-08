const productService = require("./product.service");
const productBulkService = require("./product.bulk.service");
const productExportService = require("./product.export.service");

const bulkService = require("./product.bulk.service");
const exportService = require("./product.export.service");

const asyncHandler = require("../../utils/asyncHandler");
const messages = require("../../utils/messages");

exports.create = asyncHandler(async (req, res) => {

    const payload = {
        ...req.body,
        imagePath: req.file
            ? `/uploads/products/${req.file.filename}`
            : null,
    };

    const product =
        await productService.create(payload);

    return res.created(
        product,
        messages.PRODUCT_CREATED
    );

});

exports.findAll = asyncHandler(async (req, res) => {

    const result =
        await productService.findAll(req.query);

    const {
        count,
        rows,
    } = result;

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

    const product =
        await productService.findByUniqueId(
            req.params.uniqueId
        );

    return res.success(
        product,
        messages.FETCHED
    );

});

exports.update = asyncHandler(async (req, res) => {

    const payload = {
        ...req.body,
    };

    if (req.file) {
        payload.imagePath =
            `/uploads/products/${req.file.filename}`;
    }

    const product =
        await productService.update(
            req.params.uniqueId,
            payload
        );

    return res.updated(
        product,
        messages.PRODUCT_UPDATED
    );

});

exports.delete = asyncHandler(async (req, res) => {

    await productService.delete(
        req.params.uniqueId
    );

    return res.deleted(
        messages.PRODUCT_DELETED
    );

});

exports.bulkUpload = asyncHandler(async (req, res) => {

    if (!req.file) {

        return res.badRequest(
            "Please upload a CSV or XLSX file."
        );

    }

    const result =
        await bulkService.bulkUpload(
            req.file.path
        );

    return res.success(
        result,
        "Products imported successfully."
    );

});

exports.exportCsv = asyncHandler(async (req, res) => {

    await exportService.exportCsv(
        req.query,
        res
    );

});

exports.exportXlsx = asyncHandler(async (req, res) => {

    await exportService.exportXlsx(
        req.query,
        res
    );

});