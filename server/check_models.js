const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAllModels() {
    try {
        console.log("Listing all available models for this key...");
        // Actually the SDK doesn't have a direct listModels method, 
        // common practice is indeed checking common names or using the REST API.
        // But some SDK versions might have it? Let's check.
        // Actually, let's try the absolute most common ones.
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-pro'];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("hi");
                console.log(`✅ [OK] ${modelName}`);
                break; // Stop at first working one
            } catch (e) {
                console.log(`❌ [FAIL] ${modelName}: ${e.message.split('\n')[0]}`);
            }
        }
    } catch (error) {
        console.error("Critical failure:", error);
    }
}

listAllModels();
