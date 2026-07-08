const categoryRepository = require("./category.repository");

const apiError = require("../../utils/apiError");
const HTTP = require("../../utils/httpStatus");
const messages = require("../../utils/messages");


exports.create = async (payload) => {


    const existingCategory =
        await categoryRepository.findByName(payload.name);


    if (existingCategory) {

        throw apiError(
            HTTP.CONFLICT,
            messages.CATEGORY_EXISTS
        );

    }


    const category =
        await categoryRepository.create(payload);


    return category;

};



exports.findAll = async (query = {}) => {


    const {
        page = 1,
        limit = 10,
        search = ""
    } = query;


    
    return categoryRepository.findAll({
        page,
        limit,
        search
    });

};



exports.findByUniqueId = async (uniqueId) => {


    const category =
        await categoryRepository.findByUniqueId(uniqueId);


    if (!category) {

        throw apiError(
            HTTP.NOT_FOUND,
            messages.CATEGORY_NOT_FOUND
        );

    }


    return category;

};



exports.update = async (uniqueId, payload) => {


    const category =
        await categoryRepository.findByUniqueId(uniqueId);


    if (!category) {

        throw apiError(
            HTTP.NOT_FOUND,
            messages.CATEGORY_NOT_FOUND
        );

    }



    if (payload.name) {

        const existingCategory =
            await categoryRepository.findByName(payload.name);


        if (
            existingCategory &&
            existingCategory.uniqueId !== uniqueId
        ) {

            throw apiError(
                HTTP.CONFLICT,
                messages.CATEGORY_EXISTS
            );

        }

    }



    return categoryRepository.update(
        uniqueId,
        payload
    );

};



exports.delete = async (uniqueId) => {


    const category =
        await categoryRepository.findByUniqueId(uniqueId);



    if (!category) {

        throw apiError(
            HTTP.NOT_FOUND,
            messages.CATEGORY_NOT_FOUND
        );

    }



    await categoryRepository.delete(uniqueId);

};