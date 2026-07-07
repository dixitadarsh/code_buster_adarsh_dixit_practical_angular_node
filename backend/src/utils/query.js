module.exports = (query, searchableFields = [], sortableFields = []) => {
    const {
        search = "",
        sortBy = "createdAt",
        sortOrder = "DESC",
    } = query;

    const filters = {};

    if (search.trim()) {
        filters.search = search.trim();
    }

    const order = [
        sortableFields.includes(sortBy)
            ? sortBy
            : "createdAt",
        sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC",
    ];

    return {
        filters,
        order,
    };
};