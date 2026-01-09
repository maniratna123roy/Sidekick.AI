const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

/**
 * Generate embedding for a given text
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - The embedding vector
 */
async function generateEmbedding(text) {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}

/**
 * Generate response from Gemini based on context
 * @param {string} query - user query
 * @param {Array} contextChunks - retrieved code chunks
 * @returns {Promise<string>} - The AI response
 */
async function generateResponse(query, contextChunks) {
    try {
        const contextText = contextChunks.map(chunk => `
File: ${chunk.metadata.filename}
Lines: ${chunk.metadata.startLine}-${chunk.metadata.endLine}
Code:
\`\`\`
${chunk.metadata.content}
\`\`\`
`).join('\n\n');

        const prompt = `
You are an expert AI coding assistant named Sidekick.
Answer the user's question based ONLY on the provided code context.
If the answer is not in the context, say so.
Provide code examples from the context where relevant.

Context:
${contextText}

Question: ${query}
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error generating response:", error);
        throw error;
    }
}

module.exports = {
    generateEmbedding,
    generateResponse
};
