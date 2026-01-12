import mongoose from 'mongoose';
import Course from './server/models/Course.js';

const MONGO_URI = "mongodb+srv://whoistavs:Paole5125.@devpro.ztlnv4h.mongodb.net/?appName=DevPro";

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const courses = await Course.find({}, 'title modulos aulas');

        console.log(`Total: ${courses.length}`);
        courses.forEach(c => {
            // Tenta identificar o curso da imagem que parece não ter titulo definido ou é obj?
            // Na imagem 1416: "Front-end", "Iniciante", "15h". Título não visivel mas no header tem "Admin / Professor".
            const modCount = c.modulos?.length || 0;
            const aulaCount = c.aulas?.length || 0;
            const mod1Title = c.modulos?.[0]?.title || 'N/A';
            const mod1Items = c.modulos?.[0]?.items?.length ?? c.modulos?.[0]?.aulas?.length ?? 'N/A';

            console.log(`ID: ${c._id} | Título: ${JSON.stringify(c.title).substring(0, 30)}... | Mods: ${modCount} | AulasFlat: ${aulaCount} | M1: ${mod1Title} (${mod1Items} items)`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
