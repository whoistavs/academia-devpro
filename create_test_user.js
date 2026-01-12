import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './server/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const email = "testprof@devpro.com";
        const password = "password123!";
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log("User exists, updating...");
            user.password = hashedPassword;
            user.role = 'professor';
            user.isVerified = true;
            await user.save();
        } else {
            console.log("Creating new user...");
            await User.create({
                name: "Test Professor",
                email,
                password: hashedPassword,
                role: 'professor',
                isVerified: true
            });
        }
        console.log("User ready: " + email);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
