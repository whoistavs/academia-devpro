import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

console.log('--- Environment Loaded ---');
if (process.env.EMAIL_USER) {
    console.log('EMAIL_USER:', process.env.EMAIL_USER.replace(/./g, (c, i) => i < 3 ? c : '*'));
} else {
    console.warn('WARNING: EMAIL_USER not found in .env');
}
