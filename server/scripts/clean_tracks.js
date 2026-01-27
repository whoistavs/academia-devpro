
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from parent directory (server root)
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/devpro";

const cleanTracks = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");

        const result = await mongoose.connection.collection('tracks').deleteMany({});
        console.log(`Deleted ${result.deletedCount} tracks.`);

        console.log("The server will re-seed them on next restart.");
        process.exit(0);
    } catch (error) {
        console.error("Error cleaning tracks:", error);
        process.exit(1);
    }
};

cleanTracks();
