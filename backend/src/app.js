const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiter
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Product Management API is running",
        timestamp: new Date().toISOString(),
    });
});

// API Routes
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/categories", categoryRoutes);
// app.use("/api/v1/products", productRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;