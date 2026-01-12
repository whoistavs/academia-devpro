
import mongoose from 'mongoose';
import User from './server/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const users = await User.find({});
        console.log("Users and their providers:");
        users.forEach(u => {
            console.log(`${u.email}: ${u.authProvider} (Role: ${u.role})`);
        });
        process.exit();
    })
    .catch(e => console.error(e));
