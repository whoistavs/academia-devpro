
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;

        // If URI is invalid or missing, fallback to Memory Server
        if (!uri || !uri.startsWith('mongodb')) {
            console.log("⚠️  MONGODB_URI missing or invalid.");
            console.log("🚀 Starting temporary in-memory MongoDB...");
            try {
                const mongod = await MongoMemoryServer.create();
                uri = mongod.getUri();
                console.log(`✅ In-Memory MongoDB running at: ${uri}`);
            } catch (err) {
                console.error("Failed to start Initial Memory Server:", err.message);
                uri = "mongodb://127.0.0.1:27017/academiadevpro"; // Last resort
            }
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // If connection fails (e.g. refused on 127.0.0.1), try one last attempt with Memory Server if not already tried?
        // Simpler to just crash and let user see log, OR auto-memory-server in catch block?
        // Let's keep it simple.
        console.log("Retrying with In-Memory DB as fallback...");
        try {
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log(`✅ Recovered with In-Memory MongoDB: ${uri}`);
        } catch {
            process.exit(1);
        }
    }
};

export default connectDB;
