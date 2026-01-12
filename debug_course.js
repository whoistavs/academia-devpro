
import mongoose from 'mongoose';
import Course from './server/models/Course.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const slug = 'carreira-soft-skills';
        const course = await Course.findOne({ slug });
        console.log("Course found:", course ? course.title : "No");
        if (course) {
            console.log("Aulas length:", course.aulas?.length);
            console.log("Modulos length:", course.modulos?.length);
            if (course.modulos?.length > 0) {
                const lessons = course.modulos.reduce((acc, m) => [...acc, ...(m.items || [])], []);
                console.log("First Lesson:", JSON.stringify(lessons[0], null, 2));
                console.log("Derived Lessons Count:", lessons.length);
            }
        }
        process.exit();
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
