import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../simpleDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const sourcePath = path.join(__dirname, '../../src/data/cursos.json');

console.log('Seeding courses...');

try {
    const data = fs.readFileSync(sourcePath, 'utf-8');
    const courses = JSON.parse(data);

    
    db.courses.find({}, (err, existingCourses) => {
        if (err) {
            console.error('Error checking courses:', err);
            return;
        }

        if (existingCourses.length > 0) {
            console.log(`Database already has ${existingCourses.length} courses. Skipping seed.`);
            
        } else {
            console.log(`Found ${courses.length} courses to seed.`);
            let count = 0;
            courses.forEach(course => {
                
                db.courses.insert(course, (err, newDoc) => {
                    if (err) console.error('Error inserting course:', err);
                    else {
                        count++;
                        if (count === courses.length) {
                            console.log('All courses seeded successfully!');
                        }
                    }
                });
            });
        }
    });

} catch (error) {
    console.error('Error reading source data:', error);
}
