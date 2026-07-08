const productRepository = require("./product.repository");

const apiError = require("../../utils/apiError");
const HTTP = require("../../utils/httpStatus");
const messages = require("../../utils/messages");
const exportService = require("./product.export.service");
const { deleteFile } = require("../../utils/file");

exports.create = async (payload) => {

    const category =
        await productRepository.findCategoryById(
            payload.categoryId
        );

    if (!category) {
        throw apiError(
            HTTP.NOT_FOUND,
            messages.CATEGORY_NOT_FOUND
        );
    }

    const existingProduct =
        await productRepository.findByName(
            payload.name
        );

    if (existingProduct) {
        throw apiError(
            HTTP.CONFLICT,
            messages.PRODUCT_EXISTS
        );
    }

    const product =
        await productRepository.create(payload);

    return (
        await productRepository.findByUniqueId(
            product.uniqueId
        )
    ).toJSON();

};

exports.findAll = async (query = {}) => {

    const {
        page = 1,
        limit = 10,
        search = "",
        categoryId = null,
        sortOrder = "DESC",
    } = query;

    

    return productRepository.findAll({
        page,
        limit,
        search,
        categoryId,
        sortOrder,
    });

};

exports.findByUniqueId = async (uniqueId) => {

    const product =
        await productRepository.findByUniqueId(
            uniqueId
        );

    if (!product) {
        throw apiError(
            HTTP.NOT_FOUND,
            messages.PRODUCT_NOT_FOUND
        );
    }

    return product.toJSON();

};

exports.update = async (
    uniqueId,
    payload
) => {

    const product =
        await productRepository.findByUniqueId(
            uniqueId
        );

    if (!product) {
        throw apiError(
            HTTP.NOT_FOUND,
            messages.PRODUCT_NOT_FOUND
        );
    }

    if (payload.categoryId) {

        const category =
            await productRepository.findCategoryById(
                payload.categoryId
            );

        if (!category) {
            throw apiError(
                HTTP.NOT_FOUND,
                messages.CATEGORY_NOT_FOUND
            );
        }

    }

    if (payload.name) {

        const existingProduct =
            await productRepository.findByName(
                payload.name
            );

        if (
            existingProduct &&
            existingProduct.uniqueId !== uniqueId
        ) {
            throw apiError(
                HTTP.CONFLICT,
                messages.PRODUCT_EXISTS
            );
        }

    }


    if (
        payload.imagePath &&
        product.imagePath &&
        payload.imagePath !== product.imagePath
    ) {
        deleteFile(product.imagePath);
    }

    const updatedProduct =
        await productRepository.update(
            uniqueId,
            payload
        );

    if (!updatedProduct) {
        throw apiError(
            HTTP.NOT_FOUND,
            messages.PRODUCT_NOT_FOUND
        );
    }

    return updatedProduct.toJSON();

};

exports.delete = async (uniqueId) => {

    const product =
        await productRepository.findByUniqueId(
            uniqueId
        );

    if (!product) {
        throw apiError(
            HTTP.NOT_FOUND,
            messages.PRODUCT_NOT_FOUND
        );
    }

    deleteFile(product.imagePath);
    await productRepository.delete(
        uniqueId
    );

};

exports.findAllForExport = async (
    query = {}
) => {

    const {
        search = "",
        categoryId = null,
        sortOrder = "DESC",
    } = query;

    return productRepository.findAllForExport({
        search,
        categoryId,
        sortOrder,
    });

};



exports.exportCsv = async (query, res) => {

    return exportService.exportCsv(
        query,
        res
    );

};

exports.exportXlsx = async (query, res) => {

    return exportService.exportXlsx(
        query,
        res
    );

};