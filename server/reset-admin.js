
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.join(__dirname, '../.env') });

const resetAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const email = 'octavio.marvel2018@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        console.log(`User found: ${user.name}`);

        
        const hashedPassword = bcrypt.hashSync('123456', 8);
        user.password = hashedPassword;
        user.role = 'admin'; 

        await user.save();
        console.log('SUCCESS: Password reset to "123456" and role set to "admin".');

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetAdmin();
