const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDatabase = require("./database");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    logger.success(`Server running on ${PORT}`);
  });
};

startServer();

// Graceful Shutdown
process.on("SIGINT", () => {
    console.log("\nShutting down server...");
    server.close(() => {
        console.log("Server stopped.");
        process.exit(0);
    });
});

process.on("SIGTERM", () => {
    console.log("\nSIGTERM received. Closing server...");
    server.close(() => {
        console.log("Server stopped.");
        process.exit(0);
    });
});