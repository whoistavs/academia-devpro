
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Progress from './models/Progress.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const runTest = async () => {
    try {
        console.log("🚀 Iniciando Teste de Ciclo Completo: Quiz -> Certificado -> Validação");

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academiadevpro');
        console.log("✅ Conectado ao MongoDB");

        const adminEmail = 'octavio.marvel2018@gmail.com';
        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.error("❌ Usuário admin não encontrado.");
            process.exit(1);
        }
        console.log(`👤 Usuário encontrado: ${user.name} (${user._id})`);

        const courseSlug = 'logica-de-programacao';
        const course = await Course.findOne({ slug: courseSlug });

        if (!course) {
            console.error("❌ Curso não encontrado.");
            process.exit(1);
        }
        console.log(`📚 Curso encontrado: ${course.title} (${course._id})`);

        // 1. Resetar Progresso
        console.log("\n🔄 1. Resetando Progresso...");
        let progress = await Progress.findOne({ userId: user._id, courseId: course._id });
        if (progress) {
            // Remove final_exam from lessons and scores
            progress.completedLessons = progress.completedLessons.filter(l => l !== 'final_exam');
            if (progress.quizScores) delete progress.quizScores.final_exam;
            await progress.save();
            console.log("✅ Progresso limpo (final_exam removido).");
        }

        // Limpar certificados antigos deste curso no usuário
        if (user.certificates) {
            const originalLength = user.certificates.length;
            user.certificates = user.certificates.filter(c => c.courseId.toString() !== course._id.toString());
            if (user.certificates.length !== originalLength) {
                await user.save();
                console.log("✅ Certificados antigos removidos do perfil.");
            }
        }

        // 2. Simular Aprovação no Quiz (Lógica do Endpoint /api/progress/update)
        console.log("\n📝 2. Simulando Aprovação no Quiz (Score: 100%)...");

        // Recarrega progress
        progress = await Progress.findOne({ userId: user._id, courseId: course._id });
        if (!progress) {
            progress = new Progress({ userId: user._id, courseId: course._id, completedLessons: [] });
        }

        // Update logic (copiada do server/index.js)
        const lessonId = 'final_exam';
        const score = 100;

        const newScores = { ...(progress.quizScores || {}), final_exam: score };
        progress.quizScores = newScores;

        const exists = progress.completedLessons.some(l => String(l) === 'final_exam');
        if (!exists) {
            progress.completedLessons.push('final_exam');
        }
        await progress.save();
        console.log("✅ Progresso salvo no DB.");

        // 3. Gerar Certificado (Lógica do Endpoint)
        console.log("\n🏆 3. Gerando Certificado...");

        // Recarrega user para garantir
        const userRefreshed = await User.findById(user._id);

        const certExists = userRefreshed.certificates?.some(c => c.courseId === course._id.toString());

        if (!certExists) {
            const courseCodeStr = course._id.toString().substring(0, 4).toUpperCase();
            const userCodeStr = user._id.toString().substring(0, 8).toUpperCase();
            const timestamp = Date.now().toString(36).toUpperCase();
            const uniqueCode = `DVP-${courseCodeStr}-${userCodeStr}-${timestamp}`;

            if (!userRefreshed.certificates) userRefreshed.certificates = [];
            userRefreshed.certificates.push({
                courseId: course._id.toString(),
                code: uniqueCode,
                date: new Date()
            });
            await userRefreshed.save();
            console.log(`✅ Novo Certificado Gerado: ${uniqueCode}`);

            // 4. Validar Certificado
            console.log("\n🔍 4. Testando Validação...");
            const foundUser = await User.findOne({ 'certificates.code': uniqueCode });
            if (foundUser && foundUser._id.toString() === user._id.toString()) {
                console.log("✅ SUCESSO! Certificado encontrado e validado no DB.");
                console.log(`   -> Aluno: ${foundUser.name}`);
                console.log(`   -> Código: ${uniqueCode}`);
            } else {
                console.error("❌ FALHA: Certificado não encontrado na busca inversa.");
            }

        } else {
            console.log("⚠️ Certificado já existia (não deveria acontecer após o reset).");
            const existingCert = userRefreshed.certificates.find(c => c.courseId === course._id.toString());
            console.log(`   -> Código existente: ${existingCert.code}`);
        }

    } catch (error) {
        console.error("❌ Erro fatal no teste:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n🏁 Teste Finalizado.");
    }
};

runTest();
