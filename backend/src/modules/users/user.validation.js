const { z } = require("zod");

exports.create = z.object({
    body: z.object({
        email: z.string().trim().email(),
        password: z.string().min(6).max(100),
    }),
    params: z.object({}),
    query: z.object({}),
});

exports.update = z.object({
  body: z
    .object({
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field is required for update.",
      }
    ),
  params: z.object({
    uniqueId: z.string().uuid(),
  }),
  query: z.object({}),
});

exports.getById = z.object({
    body: z.object({}),
    params: z.object({
        uniqueId: z.string().uuid(),
    }),
    query: z.object({}),
});

exports.delete = z.object({
    body: z.object({}),
    params: z.object({
        uniqueId: z.string().uuid(),
    }),
    query: z.object({}),
});