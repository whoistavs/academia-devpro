import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// ... (imports)
import fs from 'fs';

// ... (setup)

const logFile = path.join(__dirname, '../email_test_result.txt');
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

// Clear previous log
if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

log('\n--- VERIFICAÇÃO DE CONFIGURAÇÃO DE EMAIL ---\n');

// 1. Check Variables
const requiredVars = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'FRONTEND_URL'
];

let missing = false;
requiredVars.forEach(v => {
    if (!process.env[v]) {
        log(`[X] FALTANDO (MISSING): ${v}`);
        missing = true;
    } else {
        const val = v === 'EMAIL_PASS' ? '******' : process.env[v];
        log(`[OK] ${v}: ${val}`);
    }
});

// ... (logic)

// 2. Test Connection
if (!missing) {
    log('\n--- TESTANDO CONEXÃO SMTP ---\n');
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        log('[SUCESSO] Conexão com o servidor de email ESTABELECIDA!');
        log('Seu backend está pronto para enviar emails.');
    } catch (error) {
        log('[FALHA] Não foi possível conectar ao servidor de email.');
        log('Erro: ' + error.message);
        if (error.code === 'EAUTH') {
            log('DICA: Verifique se sua senha de aplicativo (App Password) está correta.');
        }
    }
}
log('\n--------------------------------------------\n');
