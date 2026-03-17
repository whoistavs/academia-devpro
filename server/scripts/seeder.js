import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Coupon from '../models/Coupon.js';
import Track from '../models/Track.js';
import { cleanupEmptyCourses } from './cleanup_courses.js';
import { tracks as initialTracks } from '../tracks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, '..');

export async function runSeeder() {
    try {
        await cleanupEmptyCourses();

        console.log("Syncing Users from users.json...");
        const usersPath = path.join(serverDir, 'users.json');
        if (fs.existsSync(usersPath)) {
            const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
            for (const u of users) {
                const existing = await User.findOne({ email: u.email });
                if (!existing) {
                    const userData = { ...u };
                    if (userData._id && userData._id.length !== 24) delete userData._id;
                    await User.create(userData);
                } else {
                    if (u.password && u.password !== existing.password) existing.password = u.password;
                    if (u.role && u.role !== existing.role) existing.role = u.role;
                    if (u.name && u.name !== existing.name) existing.name = u.name;
                    await existing.save();
                }
            }
            console.log(`Synced ${users.length} users from users.json`);
        }

        const adminEmail = 'octavio.marvel2018@gmail.com';
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            console.log("Seeding Admin User (Fallback)...");
            const hashedPassword = await bcrypt.hash('123456', 10);
            await User.create({
                name: "Octavio Rodrigues Schwab",
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                verified: true,
                isVerified: true,
                profileCompleted: true,
                bankAccount: { pixKey: '13eede2d-188c-456e-a39c-17fa855e496b' }
            });
            console.log("Admin seeded. Login with: 123456");
        }

        // Coupons
        const couponsPath = path.join(serverDir, 'coupons.json');
        if (fs.existsSync(couponsPath)) {
            const coupons = JSON.parse(fs.readFileSync(couponsPath, 'utf-8'));
            for (const c of coupons) {
                const exists = await Coupon.findOne({ code: c.code });
                if (!exists) await Coupon.create(c);
                else {
                    exists.discountPercentage = c.discountPercentage;
                    exists.validUntil = c.validUntil;
                    await exists.save();
                }
            }
        }

        // Courses
        const courseCount = await Course.countDocuments();
        if (courseCount === 0) {
            console.log("Database empty. Seeding initial courses...");
            const dataPath = path.join(serverDir, 'courses.json');
            if (fs.existsSync(dataPath)) {
                const courses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
                const adminUser = await User.findOne({ email: adminEmail });
                const authorId = adminUser ? adminUser._id : 'admin';

                for (const c of courses) {
                    const slug = c.slug || (typeof c.title === 'string' ? c.title : (c.title.pt || 'curso')).toLowerCase().replace(/[^a-z0-9]/g, '-');
                    const { _id, ...courseData } = c;
                    await Course.create({
                        ...courseData,
                        _id: _id && _id.length === 24 ? _id : undefined,
                        slug,
                        authorId,
                        status: 'published'
                    });
                }
                console.log("Course Seeding complete.");
            }
        }

        // Tracks
        const trackCount = await Track.countDocuments();
        if (trackCount === 0) {
            console.log("Seeding Tracks from static file...");
            for (const t of initialTracks) {
                await Track.create({
                    ...t,
                    modules: t.courses || [],
                    bundlePrice: t.price,
                    icon: "",
                    gradient: "from-indigo-500 to-purple-600"
                });
            }
            console.log(`Seeded ${initialTracks.length} tracks.`);
        }

    } catch (e) {
        console.error("Seeding error:", e);
    }
}
