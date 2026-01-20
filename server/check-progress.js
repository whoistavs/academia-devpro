
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Progress from './models/Progress.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const run = async () => {
    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/academiadevpro');
        console.log("Connected.");

        const email = 'octavio.marvel2018@gmail.com';
        const courseSlug = 'logica-de-programacao';

        const user = await User.findOne({ email });
        const course = await Course.findOne({ slug: courseSlug });

        if (user && course) {
            const progress = await Progress.findOne({ userId: user._id, courseId: course._id });
            console.log(`User: ${user.name}`);
            console.log(`Course: ${course.title.pt}`);
            console.log(`Total Lessons (Course Model): ${(course.modulos?.length || 0) * 4}`); // Enumero 4 aulas por módulo aprox?

            if (progress) {
                console.log(`Completed Lessons Count: ${progress.completedLessons.length}`);
                console.log(`Completed Lessons IDs:`, progress.completedLessons);
            } else {
                console.log("No progress document found.");
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
