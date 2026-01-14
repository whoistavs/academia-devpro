
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log(`Testing Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'}`);

async function checkModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
            console.error(`Error ${res.status}:`, data);
            return;
        }

        console.log("✅ Models API Accessible! Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models array found.");
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

checkModels();
