const { z } = require("zod");


exports.create = z.object({

    body: z.object({

        name: z
            .string()
            .trim()
            .min(2, "Category name must be at least 2 characters.")
            .max(255, "Category name cannot exceed 255 characters."),

    }),

    params: z.object({}),

    query: z.object({}),
});


exports.update = z.object({

    body: z.object({

        name: z
            .string()
            .trim()
            .min(2, "Category name must be at least 2 characters.")
            .max(255, "Category name cannot exceed 255 characters.")
            .optional(),

    }),

    params: z.object({

        uniqueId: z
            .string()
            .uuid("Invalid category unique id."),

    }),

    query: z.object({}),
});


exports.getById = z.object({

    body: z.object({}),

    params: z.object({

        uniqueId: z
            .string()
            .uuid("Invalid category unique id."),

    }),

    query: z.object({}),

});


exports.delete = z.object({

    body: z.object({}),

    params: z.object({

        uniqueId: z
            .string()
            .uuid("Invalid category unique id."),

    }),

    query: z.object({}),
});