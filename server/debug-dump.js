
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const run = async () => {
    let output = "";
    const log = (msg) => { console.log(msg); output += msg + "\n"; };

    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/academiadevpro');
        log("Connected to DB.");

        const email = 'octavio.marvel2018@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            log("User not found: " + email);
        } else {
            log(`User Found: ${user.name}`);
            log(`User ID: ${user._id}`);
            log("Certificates:");
            log(JSON.stringify(user.certificates, null, 2));
        }

        const course = await Course.findOne({ slug: 'logica-de-programacao' });
        if (!course) {
            log("Course not found");
        } else {
            log(`Course Found: ${course.title.pt}`);
            log(`Course ID: ${course._id}`);
        }

        fs.writeFileSync('debug_state.txt', output);

    } catch (e) {
        log("ERROR: " + e.message);
        fs.writeFileSync('debug_state.txt', output);
    } finally {
        await mongoose.disconnect();
    }
};

run();
