
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;


        if (!uri || !uri.startsWith('mongodb')) {
            console.log("⚠️  MONGODB_URI missing or invalid.");
            console.log("🚀 Starting temporary in-memory MongoDB...");
            try {
                const mongod = await MongoMemoryServer.create();
                uri = mongod.getUri();
                console.log(`✅ In-Memory MongoDB running at: ${uri}`);
            } catch (err) {
                console.error("Failed to start Initial Memory Server:", err.message);
                uri = "mongodb://127.0.0.1:27017/academiadevpro";
            }
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);



        console.log("Retrying with In-Memory DB as fallback...");
        try {
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log(`✅ Recovered with In-Memory MongoDB: ${uri}`);
        } catch (fallbackError) {
            console.error("❌ Fallback In-Memory DB failed:", fallbackError);
            process.exit(1);
        }
    }
};

export default connectDB;
