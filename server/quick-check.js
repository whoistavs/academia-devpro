
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academiadevpro');

        const user = await User.findOne({ email: 'octavio.marvel2018@gmail.com' });

        console.log("--- DEBUG START ---");
        if (!user) {
            console.log("User not found");
        } else {
            console.log("User Name:", user.name);
            console.log("Certificates Array:", JSON.stringify(user.certificates, null, 2));
        }
        console.log("--- DEBUG END ---");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
