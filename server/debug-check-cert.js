
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const checkCert = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academiadevpro');
        console.log("Conectado ao MongoDB");

        const user = await User.findOne({ email: 'octavio.marvel2018@gmail.com' });

        if (user) {
            console.log(`Usuário: ${user.name}`);
            console.log("Certificados no Banco:");
            console.log(JSON.stringify(user.certificates, null, 2));
        } else {
            console.log("Usuário não encontrado.");
        }

    } catch (error) {
        console.error("Erro:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkCert();
