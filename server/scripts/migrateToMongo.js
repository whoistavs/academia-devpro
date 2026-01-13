
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Course from '../models/Course.js';
import User from '../models/User.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../../'); 

dotenv.config({ path: path.join(rootDir, '.env') });

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Connection Error:', error);
        process.exit(1);
    }
};

const migrate = async () => {
    await connectDB();

    console.log("Starting migration...");

    try {
        const coursesPath = path.join(rootDir, 'src/data/cursos.json'); 
        
        let coursesData = [];
        const serverCoursesPath = path.join(rootDir, 'server/courses.json');

        if (fs.existsSync(serverCoursesPath)) {
            console.log("Reading from server/courses.json");
            coursesData = JSON.parse(fs.readFileSync(serverCoursesPath, 'utf-8'));
        } else if (fs.existsSync(coursesPath)) {
            console.log("Reading from src/data/cursos.json");
            coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));
        }

        if (coursesData.length > 0) {
            for (const course of coursesData) {
                
                
                

                let slug = course.slug;
                if (!slug) {
                    const titleStr = typeof course.title === 'string' ? course.title : (course.title.pt || 'curso');
                    slug = titleStr.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
                }

                await Course.findOneAndUpdate(
                    { slug: slug },
                    {
                        title: course.title,
                        description: course.description,
                        category: course.category,
                        level: course.level,
                        image: course.image,
                        duration: course.duration,
                        slug: slug,
                        modulos: course.modulos || [],
                        aulas: course.aulas || [],
                        status: course.status || 'published',
                        authorId: course.authorId || 'admin'
                    },
                    { upsert: true, new: true }
                );
            }
            console.log(`Migrated ${coursesData.length} courses.`);
        } else {
            console.log("No courses found to migrate.");
        }

    } catch (e) {
        console.error("Migration Error:", e);
    }

    console.log("Done.");
    process.exit(0);
};

migrate();
