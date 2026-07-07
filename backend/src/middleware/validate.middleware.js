module.exports = (schema) => {
    return async (req, res, next) => {
        try {
            const validatedData = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            req.body = validatedData.body;
            req.query = validatedData.query;
            req.params = validatedData.params;

            next();
        } catch (error) {
            next(error);
        }
    };
};