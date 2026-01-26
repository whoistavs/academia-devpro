import mongoose from 'mongoose';
import Course from './server/models/Course.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env
dotenv.config();

// Se não achar no raiz, tenta buscar onde estiver
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("❌ Erro: MONGODB_URI não encontrada no .env");
    console.log("👉 Dica: Crie um arquivo .env na raiz com MONGODB_URI=sua_conexao_atlas");
    process.exit(1);
}

const courses = [
    {
        title: { pt: 'Fullstack Master: Do Zero ao Profissional', en: 'Fullstack Master: From Zero to Hero' },
        description: { pt: 'Domine React, Node.js e construa aplicações completas.', en: 'Master React, Node.js and build complete apps.' },
        price: 29.90,
        category: 'Front-end',
        slug: 'fullstack-master',
        status: 'published',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
        rating: 4.8,
        totalStudents: 1250,
        modulos: [
            { id: 1, title: 'Introdução ao React', aulas: [{ id: 101, title: 'Configurando o Ambiente' }, { id: 102, title: 'Componentes e Props' }] },
            { id: 2, title: 'Node.js e API', aulas: [{ id: 201, title: 'Criando servidor Express' }, { id: 202, title: 'Conectando ao MongoDB' }] }
        ]
    },
    {
        title: { pt: 'Python para Data Science', en: 'Python for Data Science' },
        description: { pt: 'Aprenda análise de dados, Pandas e Machine Learning.', en: 'Learn data analysis, Pandas and Machine Learning.' },
        price: 39.90,
        category: 'Data Science',
        slug: 'python-data-science',
        status: 'published',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop',
        rating: 4.9,
        totalStudents: 850,
        modulos: [
            { id: 1, title: 'Fundamentos de Python', aulas: [{ id: 101, title: 'Variáveis e Tipos' }] },
            { id: 2, title: 'Pandas & NumPy', aulas: [{ id: 201, title: 'Dataframes' }] }
        ]
    },
    {
        title: { pt: 'Mobile com React Native', en: 'Mobile with React Native' },
        description: { pt: 'Crie apps para iOS e Android com uma única base de código.', en: 'Create iOS and Android apps with a single codebase.' },
        price: 34.90,
        category: 'Mobile',
        slug: 'react-native-pro',
        status: 'published',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop',
        rating: 4.7,
        totalStudents: 640,
        modulos: []
    }
];

const seed = async () => {
    try {
        console.log("conectando ao MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Conectado!");

        console.log("🧹 Limpando cursos antigos...");
        await Course.deleteMany({});

        console.log("🌱 Criando cursos...");
        await Course.insertMany(courses);

        console.log("🎉 Sucesso! Banco populado.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Erro:", e);
        process.exit(1);
    }
};

seed();
