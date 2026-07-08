const { z } = require("zod");

exports.create = z.object({

    body: z.object({

        categoryId: z.coerce
            .number()
            .int()
            .positive("Category is required."),

        name: z
            .string()
            .trim()
            .min(2, "Product name must be at least 2 characters.")
            .max(255, "Product name cannot exceed 255 characters."),

        price: z.coerce
            .number()
            .min(0, "Price must be greater than or equal to 0."),

    }),

    params: z.object({}),

    query: z.object({}),

});

exports.update = z.object({

    body: z.object({

        categoryId: z.coerce
            .number()
            .int()
            .positive()
            .optional(),

        name: z
            .string()
            .trim()
            .min(2)
            .max(255)
            .optional(),

        price: z.coerce
            .number()
            .min(0)
            .optional(),

    }),

    params: z.object({

        uniqueId: z
            .string()
            .uuid("Invalid product unique id."),

    }),

    query: z.object({}),

});

exports.delete = z.object({

    body: z.object({}),

    params: z.object({

        uniqueId: z
            .string()
            .uuid("Invalid product unique id."),

    }),

    query: z.object({}),

});

exports.getById = z.object({

    body: z.object({}),

    params: z.object({

        uniqueId: z
            .string()
            .uuid("Invalid product unique id."),

    }),

    query: z.object({}),

});

exports.findAll = z.object({

    body: z.object({}),

    params: z.object({}),

    query: z.object({

        page: z.coerce
            .number()
            .int()
            .positive()
            .optional(),

        limit: z.coerce
            .number()
            .int()
            .positive()
            .max(100)
            .optional(),

        search: z
            .string()
            .trim()
            .optional(),

        categoryId: z.coerce
            .number()
            .int()
            .positive()
            .optional(),

        sortOrder: z
            .enum([
                "ASC",
                "DESC",
                "asc",
                "desc",
            ])
            .optional(),

    }),

});

exports.bulkUpload = z.object({

    body: z.object({}),

    params: z.object({}),

    query: z.object({}),

});

exports.exportCsv = z.object({

    body: z.object({}),

    params: z.object({}),

    query: z.object({

        search: z
            .string()
            .trim()
            .optional(),

        categoryId: z.coerce
            .number()
            .int()
            .positive()
            .optional(),

        sortOrder: z
            .enum([
                "ASC",
                "DESC",
                "asc",
                "desc",
            ])
            .optional(),

    }),

});

exports.exportXlsx = exports.exportCsv;