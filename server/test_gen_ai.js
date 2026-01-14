
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log(`Testing Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'}`);

async function testGenAI() {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("✅ Success! Response:", response.text());
    } catch (e) {
        console.error("❌ Error:", e.message);
        if (e.response) {
            console.error("Details:", JSON.stringify(e.response, null, 2));
        }
    }
}

testGenAI();
