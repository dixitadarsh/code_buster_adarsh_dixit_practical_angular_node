const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const logger = require("./utils/logger");
const security = require("./config/security");

const responseMiddleware = require("./helpers/response");
const errorMiddleware = require("./middleware/error.middleware");
const notFoundMiddleware = require("./middleware/notFount.middleware");
const requestIdMiddleware = require("./middleware/requestId.middleware");
const requestLoggerMiddleware = require("./middleware/requestLogger.middleware");

/* ============================================
    ROUTES IMPORT
=============================================*/
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");


const app = express();

// Security Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

security(app);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Request Logger
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Response Helper
app.use(responseMiddleware);

// After response middleware
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// Health Check
app.get("/", (req, res) => {
  return res.success({
    name: "Product Management API",
    version: "1.0.0",
  });
});

// 404
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;