require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key loaded:", apiKey ? "Yes (starts with " + apiKey.substring(0, 4) + ")" : "No");

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

async function testModels() {
    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'OK'");
            const response = await result.response;
            console.log(`SUCCESS: ${modelName} responded: ${response.text()}`);
            return; // Stop after first success
        } catch (error) {
            console.log(`FAILED: ${modelName} - ${error.message.split('\n')[0]}`);
        }
    }
    console.log("\nAll models failed. Please check your API Key and Google Cloud Project settings.");
}

testModels();
