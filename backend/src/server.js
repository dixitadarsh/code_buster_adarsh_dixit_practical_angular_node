const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDatabase = require("./database");
const logger = require("./utils/logger");
const env = require("./config/env");

const PORT = env.PORT || 3000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    logger.success(`Server running on ${PORT}`);
  });
};

startServer();

// Graceful Shutdown
process.on("SIGINT", () => {
    logger.info("\nShutting down server...");
    server.close(() => {
        logger.info("Server stopped.");
        process.exit(0);
    });
});

process.on("SIGTERM", () => {
    logger.info("\nSIGTERM received. Closing server...");
    server.close(() => {
        logger.info("Server stopped.");
        process.exit(0);
    });
});