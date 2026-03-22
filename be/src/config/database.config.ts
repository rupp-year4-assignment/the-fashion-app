import mongoose from "mongoose";

class DBConfig {
  public async connectDB() {
    try {
      const mongoURI =
        process.env.MONGO_URI ||
        "mongodb://superuser:superuser@localhost:27017/theFashionAppDB?authSource=admin";

      const options: any = {
        authSource: process.env.MONGO_AUTH_DB || "admin",
        serverSelectionTimeoutMS:
          Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      };

      await mongoose.connect(mongoURI, options);

      console.info("Database connected successfully.");
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err);
      throw err; 
    }
  }
}

export default new DBConfig();
