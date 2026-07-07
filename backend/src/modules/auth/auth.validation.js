const { z } = require("zod");

exports.register = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character."
      ),
  }),
  params: z.object({}),
  query: z.object({}),
});

exports.login = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address."),

    password: z
      .string()
      .min(1, "Password is required."),
  }),
  params: z.object({}),
  query: z.object({}),
});

exports.refreshToken = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required."),
  }),
  params: z.object({}),
  query: z.object({}),
});

exports.logout = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});