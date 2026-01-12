import mongoose from 'mongoose';
import Course from './server/models/Course.js';

// URL Hardcoded do seu ambiente para garantir conexão
const MONGO_URI = "mongodb+srv://whoistavs:Paole5125.@devpro.ztlnv4h.mongodb.net/?appName=DevPro";

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Conectado ao Mongo. Buscando cursos...");

        const courses = await Course.find({}).sort({ updatedAt: -1 }).limit(5); // Pega os 5 últimos editados

        courses.forEach(c => {
            console.log(`\n================================`);
            console.log(`CURSO: ${c.title} (ID: ${c._id})`);
            console.log(`Módulos Salvos (Length: ${c.modulos?.length}):`);
            console.log(JSON.stringify(c.modulos, null, 2));
            console.log(`Aulas Salvas (Length: ${c.aulas?.length}):`);
            console.log(JSON.stringify(c.aulas, null, 2));
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
