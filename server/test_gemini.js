require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // There isn't a direct listModels on the main class in the Node SDK usually exposed easily,
        // but we can try to get a model and run a dummy prompt, OR assume standard names.
        // Actually, the error message suggested calling ListModels.
        // The SDK might access it via the model manager if exposed, OR we just try a known working model.

        // Let's try 'gemini-pro' (1.0) to see if that works.
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro check:", result.response.text());

        // Let's try 'gemini-1.5-flash' again
        const flash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const flashResult = await flash.generateContent("Hello");
        console.log("gemini-1.5-flash check:", flashResult.response.text());

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
