import jwt from 'jsonwebtoken';


const SECRET_KEY = "chave_secreta_super_segura";
const API_URL = "http://localhost:3000";


const token = jwt.sign({ id: 'test-user', role: 'student' }, SECRET_KEY, { expiresIn: '1h' });

async function testScenario(name, payload) {
    console.log(`\n🔍 Testing Scenario: ${name}`);
    console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

    try {
        const res = await fetch(`${API_URL}/api/ai/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("⬇️  Response:");
        console.log(JSON.stringify(data, null, 2));

        if (name.includes("Valid") && data.isCorrect === true) console.log("✅ PASS: Correctly accepted.");
        else if (name.includes("Invalid") && data.isCorrect === false) console.log("✅ PASS: Correctly rejected.");
        else console.log("❌ FAIL: Unexpected result.");

    } catch (err) {
        console.error("❌ Request Failed:", err.message);
    }
}

async function runTests() {
    console.log("🚀 Starting System Verification...");

    
    await testScenario("Valid Answer (Traffic Light)", {
        lessonId: 0,
        challengeId: "c1m1",
        instruction: "Escreva um algoritmo para um semáforo que abre para ambulâncias.",
        userResponse: "Se sensor_ambulancia detectado ENTÃO Fechar sinais pedestres; Abrir sinal verde ambulancia; FIM SE"
    });

    
    console.log("⏳ Waiting 10s to respect rate limit...");
    await new Promise(r => setTimeout(r, 10000));

    await testScenario("Invalid Answer (Irrelevant)", {
        lessonId: 0,
        challengeId: "c1m1",
        instruction: "Escreva um algoritmo para um semáforo que abre para ambulâncias.",
        userResponse: "Eu gosto muito de batata frita com cheddar."
    });
}

runTests();
