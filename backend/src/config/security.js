const helmet = require("helmet");
const compression = require("compression");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

module.exports = (app) => {
    app.use(
        helmet({
            crossOriginResourcePolicy: false,
        })
    );

    app.use(compression());

    app.use(hpp());

    app.use("/api", apiLimiter);
};