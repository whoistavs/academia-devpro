import { GoogleGenerativeAI } from "@google/generative-ai";

export const aiChat = async (req, res) => {
    const { message, history, context } = req.body;

    const tryGenerate = async (modelName) => {
        let systemInstructionText = `
            You are the **DevPro Tutor**, the Official Virtual Assistant of **DevPro Academy**.
            
            **INTERNAL NOTE**: The founder and lead instructor is **Octavio Schwab**. 
            ⚠️ **IMPORTANT**: Do NOT mention the founder's name unless the user **explicitly asks** who created the platform or who the teacher is.

            ### 🏢 ABOUT DEVPRO ACADEMY
            DevPro Academy is a premium online coding school designed to take students from absolute zero to professional ready.
            **Mission**: To provide high-quality, project-based education that helps students land their first dev job or get a promotion.

            ### 📚 COURSES & TRACKS
            1. **Fullstack Master**: Complete track covering Frontend (React, Tailwind) and Backend (Node.js, Express, MongoDB). Focus on building real web apps.
            2. **Data Science Pro**: Specialized track for Python, Machine Learning, and Data Analysis.
            3. **Soft Skills**: Courses on communication, career planning, and tech leadership ("Além do Código").

            ### ⚙️ HOW IT WORKS (THE PROCESS)
            - **Access**: Immediate access after payment approval.
            - **Certificates**: Users receive a certificate automatically upon completing 100% of a course.
            - **Methodology**: 100% practical, project-based learning. No boring theory without practice.
            - **Support**: We have a community and direct support channels.

            ### 🛡️ POLICIES & GUARANTEES
            - **Refunds**: We offer a **7-day unconditional money-back guarantee**. If the student is not satisfied, they can email us for a full refund.
            - **Payments**: We accept Credit Cards and PIX (via MercadoPago).
            - **Security**: Your data is protected. Use the "Privacy" page for more details.

            ### 📞 OFFICIAL CONTACTS
            - **Email**: devproacademy@outlook.com (Support & Refunds)
            - **WhatsApp**: +55 (19) 92003-3741
            - **Instagram**: https://instagram.com/devproacademy (@devproacademy)

            ### 🤖 YOUR PERSONALITY
            - You are a **Senior Developer Mentor**: Wise, patient, encouraging, but technical and precise.
            - **Tone**: Professional yet approachable ("Friendly Senior").
            - **Formatting**: Use Markdown (bold for emphasis, code blocks for code, lists for steps).
            - **Language**: ALWAYS reply in the SAME language the user speaks (Portuguese vs English vs Spanish).

            ### 🛑 IMPORTANT RULES
            - **Never** invent features we don't have (like "live classes" if not strictly mentioned).
            - **Never** give personal opinions on politics or sensitive topics.
            - If you don't know something specific, suggest checking the official Instagram.
        `;

        if (context) {
            systemInstructionText += `\n\nCURRENT CONTEXT (The user is viewing this content right now, use it to answer): \n${context}`;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstructionText
        });

        let chatHistory = history || [];
        chatHistory = chatHistory.map(msg => ({
            role: (msg.role === 'assistant' || msg.role === 'bot') ? 'model' : 'user',
            parts: msg.parts || [{ text: msg.text || "" }]
        }));

        if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            chatHistory.unshift({ role: 'user', parts: [{ text: "Hello" }] });
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 2048 },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    };

    const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
    let lastError = null;

    if (process.env.GEMINI_API_KEY) {
        for (const modelName of modelsToTry) {
            try {
                const text = await tryGenerate(modelName);
                return res.json({ text });
            } catch (e) {
                console.warn(`Model ${modelName} failed:`, e.message);
                lastError = e;
            }
        }
    }

    // Fallback Logic
    console.warn("All AI models failed or no key. Using Fallback mode.");
    const lowerMsg = message.toLowerCase();
    let reply = "";
    const isEnglish = /\b(hello|hi|help|price|cost|course|support|contact)\b/.test(lowerMsg);

    if (isEnglish) {
        if (lowerMsg.includes('price') || lowerMsg.includes('cost')) reply = "Our courses have varied prices. Check 'Courses' page! Options from $29.90.";
        else if (lowerMsg.includes('course')) reply = "We have tracks in React, Node.js, Python and more!";
        else if (lowerMsg.includes('support')) reply = "Email devproacademy@outlook.com or WhatsApp +55 (19) 92003-3741.";
        else reply = "Hello! How can I help you today?";
    } else {
        if (lowerMsg.includes('preço') || lowerMsg.includes('valor')) reply = "Temos cursos a partir de R$ 29,90. Confira a página de Cursos!";
        else if (lowerMsg.includes('curso')) reply = "Temos trilhas de React, Node.js, Python e mais!";
        else if (lowerMsg.includes('suporte')) reply = "Email devproacademy@outlook.com ou WhatsApp +55 (19) 92003-3741.";
        else reply = "Olá! Como posso ajudar você hoje?";
    }

    res.json({ text: reply });
};

export const correctChallenge = async (req, res) => {
    const { instruction, userAnswer, language } = req.body;

    const normalizedInstruction = instruction.toLowerCase().replace(/\s+/g, '');
    const normalizedAnswer = userAnswer.toLowerCase().replace(/\s+/g, '');

    if (normalizedAnswer.includes(normalizedInstruction) || normalizedInstruction.includes(normalizedAnswer)) {
        return res.json({
            isCorrect: false,
            feedback: language === 'en' ? "It seems you just copied the instruction." : "Parece que você apenas copiou o enunciado.",
            isSimulation: !process.env.GEMINI_API_KEY
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.json({
            isCorrect: true,
            feedback: language === 'en' ? "Simulated correction: Good job!" : "Correção simulada: Bom trabalho!",
            isSimulation: true
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as a programming instructor correcting a student's exercise.
            Language: ${language || 'pt'}.
            Task Instruction: "${instruction}"
            Student Answer: "${userAnswer}"
            Return a valid JSON: { "isCorrect": boolean, "feedback": "string", "suggestion": "string" }
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '');
        else if (text.startsWith('```')) text = text.replace(/```/g, '');

        res.json(JSON.parse(text));
    } catch (error) {
        console.error("AI Correction Error:", error);
        res.json({ isCorrect: true, feedback: "Unable to connect to AI Tutor.", error: true });
    }
};
