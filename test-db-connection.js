
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log("Tentando conectar ao MongoDB...");
console.log("URI (parcial):", uri ? uri.substring(0, 20) + "..." : "UNDEFINED");

if (!uri) {
    console.error("ERRO: MONGODB_URI não encontrada no arquivo .env");
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log("✅ SUCESSO! Conexão estabelecida com o MongoDB.");
        console.log("Sua senha e usuário estão corretos.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ FALHA NA CONEXÃO:");
        console.error(err.message);

        if (err.message.includes('bad auth')) {
            console.log("\n--- DICA ---");
            console.log("Erro de autenticação ('bad auth'). Verifique:");
            console.log("1. Se o usuário que você colocou na URL existe no 'Database Access' do Atlas.");
            console.log("2. Se a senha está digitada corretamente (cuidado com caracteres especiais).");
        }
        process.exit(1);
    });
