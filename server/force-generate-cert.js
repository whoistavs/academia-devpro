
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const run = async () => {
    try {
        // Fix: Use 127.0.0.1 instead of localhost to avoid IPv6 issues
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academiadevpro');
        console.log("Connected.");


        const email = 'octavio.marvel2018@gmail.com';
        const courseSlug = 'logica-de-programacao';

        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const course = await Course.findOne({ slug: courseSlug });
        if (!course) throw new Error("Course not found");

        console.log(`User: ${user.name}`);
        console.log(`Course: ${course.title.pt} (${course._id})`);

        // Check if exists
        const exists = user.certificates?.some(c => c.courseId === course._id.toString());
        if (exists) {
            console.log("Certificate ALREADY EXISTS in DB.");
            const cert = user.certificates.find(c => c.courseId === course._id.toString());
            console.log(`Code: ${cert.code}`);
        } else {
            console.log("Certificate missing. Creating FORCEFULLY...");

            const courseCode = course._id.toString().substring(0, 4).toUpperCase();
            const userCode = user._id.toString().substring(0, 8).toUpperCase();
            const timestamp = Date.now().toString(36).toUpperCase();
            const uniqueCode = `DVP-${courseCode}-${userCode}-${timestamp}`;

            if (!user.certificates) user.certificates = [];

            user.certificates.push({
                courseId: course._id.toString(),
                code: uniqueCode,
                date: new Date()
            });

            await user.save();
            console.log(`✅ Certificate Created: ${uniqueCode}`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
