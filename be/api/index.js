const serverless = require("serverless-http");
require("dotenv").config();

let isConnected = false;
let cachedApp = null;
let cachedHandler = null;

async function initializeApp() {
  if (cachedHandler) return cachedHandler;

  try {
    // Import compiled files (CommonJS)
    const appModule = require("../dist/app.js");
    const dbConfigModule = require("../dist/config/database.config.js");

    // Handle both ESM and CommonJS default exports
    const app = appModule.default || appModule;
    const dbConfig = dbConfigModule.default || dbConfigModule;

    if (!app) {
      console.error("App module received:", appModule);
      throw new Error("Express app not found");
    }

    if (!isConnected && process.env.MONGO_URI) {
      try {
        // Increase timeout for cold starts, but don't wait forever
        await Promise.race([
          dbConfig.connectDB(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("DB connection timeout")), 8000)
          ),
        ]);
        isConnected = true;
        console.info("Database connected (serverless)");
      } catch (dbError) {
        console.error("Database connection failed:", dbError.message);
        // Continue without DB connection
        console.warn("Continuing without database - routes may fail");
        // Set flag so we don't keep retrying on every request
        isConnected = null; // null means "failed, don't retry"
      }
    } else if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI not set - skipping database connection");
      isConnected = null;
    }

    cachedApp = app;
    cachedHandler = serverless(app);
    return cachedHandler;
  } catch (err) {
    console.error("App init failed:", err);
    throw err;
  }
}

module.exports = async (req, res) => {
  try {
    // Wrap entire handler with timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 9000)
    );

    const handlerPromise = (async () => {
      const handler = await initializeApp();
      return await handler(req, res);
    })();

    await Promise.race([handlerPromise, timeoutPromise]);
  } catch (err) {
    console.error("Serverless handler crash:", err);

    // Check if response already sent
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
};
