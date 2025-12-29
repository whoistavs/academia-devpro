import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log(`Checking models for Key: ${apiKey ? apiKey.substring(0, 5) + '...' : 'MISSING'}`);

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
            fs.writeFileSync('server/debug_models_error.json', JSON.stringify(data.error, null, 2));
        } else {
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(m => console.log(`- ${m.name}`));
                fs.writeFileSync('server/debug_models.json', JSON.stringify(data.models, null, 2));
            } else {
                console.log("No models returned.");
            }
        }
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

listModels();
