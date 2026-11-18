import mongoose from "mongoose";
import dns from "node:dns";

process.loadEnvFile();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "Movie_App"
        });

        console.log("MongoDB connected successfully");

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}