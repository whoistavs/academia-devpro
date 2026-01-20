import mongoose from 'mongoose';
import Coupon from './models/Coupon.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academiadevpro');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const createCoupon = async () => {
    await connectDB();

    try {
        const code = 'INSTA10';
        const existing = await Coupon.findOne({ code });
        if (existing) {
            console.log(`Coupon ${code} already exists.`);
            // Update it to be valid just in case
            existing.discountPercentage = 10;
            existing.validUntil = new Date('2030-01-01');
            existing.maxUses = 1000;
            existing.usedCount = 0;
            await existing.save();
            console.log(`Coupon ${code} updated/reset.`);
        } else {
            await Coupon.create({
                code,
                discountPercentage: 10,
                validUntil: new Date('2030-01-01'),
                maxUses: 1000,
                maxUsesPerUser: 1
            });
            console.log(`Coupon ${code} created.`);
        }
    } catch (e) {
        console.error("Error creating coupon:", e);
    } finally {
        mongoose.connection.close();
    }
};

createCoupon();
