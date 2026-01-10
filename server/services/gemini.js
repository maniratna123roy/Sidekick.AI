const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
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

GUIDELINES:
1. CITATIONS: Whenever you reference code, provide a markdown link like [filename:L123](https://github.com/REPO_PLACEHOLDER/blob/main/filename#L123).
2. DIAGRAMS: If explaining a flow, architecture, or state change, ALWAYS include a Mermaid.js diagram using \`\`\`mermaid blocks.
3. LANGUAGE: If the user asks in Hindi, Spanish, or English, respond in that language.
4. If the answer is not in the context, say so.

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

/**
 * Generate a Mermaid diagram for the given code
 * @param {string} codeContent 
 * @param {string} type - flowchart, sequence, or class
 * @returns {Promise<string>}
 */
async function generateMermaidDiagram(codeContent, type = 'flowchart') {
    try {
        const prompt = `
        Analyze the following code and generate a Mermaid.js ${type} diagram.
        
        CRITICAL RULES FOR MERMAID v11+ COMPATIBILITY:
        1. Return ONLY the raw Mermaid.js syntax - NO explanations, NO markdown blocks.
        2. START directly with the diagram type (e.g., "flowchart TD", "sequenceDiagram", or "classDiagram").
        3. For flowcharts, ALWAYS use "flowchart TD" (NOT "graph TD"). This is MANDATORY.
        4. Use ONLY "-->" for arrows. NEVER use "->" or "==>".
        5. Node IDs must be alphanumeric (A-Z, a-z, 0-9, underscore). NO special characters.
        6. Node labels MUST be in square brackets with quotes: NodeID["Label Text"]
        7. Escape special characters in labels: use &quot; for quotes, &amp; for ampersand.
        8. Each connection on a new line. NO semicolons.
        9. Keep it simple - max 10-15 nodes for readability.
        10. Use proper indentation for readability.

        EXAMPLE FORMAT:
        flowchart TD
            Start["Start Process"]
            Process["Process Data"]
            Decision{"Check Condition?"}
            End["End"]
            
            Start --> Process
            Process --> Decision
            Decision -->|Yes| End
            Decision -->|No| Process

        CODE TO ANALYZE:
        ${codeContent}
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        console.log(`[Gemini] Raw Mermaid Output (${text.length} chars):\n${text}`);

        // === SANITIZATION PIPELINE ===

        // 1. Extract from code blocks if wrapped
        const codeBlockMatch = text.match(/```(?:mermaid)?\s*\n([\s\S]*?)\n```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            text = codeBlockMatch[1];
        }

        // 2. Remove markdown artifacts
        text = text.replace(/```mermaid/g, '').replace(/```/g, '').trim();

        // 3. Find diagram start
        const keywords = ['flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram'];
        const lowerText = text.toLowerCase();
        let bestStart = -1;

        for (const kw of keywords) {
            const index = lowerText.indexOf(kw);
            if (index !== -1 && (bestStart === -1 || index < bestStart)) {
                bestStart = index;
            }
        }

        if (bestStart !== -1) {
            text = text.substring(bestStart);
        }

        // 4. Convert "graph" to "flowchart" for v11+ compatibility
        text = text.replace(/^graph\s+(TD|LR|BT|RL)/i, 'flowchart $1');

        // 5. Ensure flowchart has direction
        if (/^flowchart\s*$/im.test(text.split('\n')[0])) {
            text = text.replace(/^flowchart\s*$/im, 'flowchart TD');
        }

        // 6. Force TD (Top-Down) orientation
        text = text.replace(/^flowchart\s+(LR|BT|RL)/i, 'flowchart TD');

        // 7. Fix arrow syntax: -> to -->
        text = text.replace(/(\w+)\s+->\s+(\w+)/g, '$1 --> $2');
        text = text.replace(/(\w+)\s+==>\s+(\w+)/g, '$1 --> $2');

        // 8. Replace semicolons with newlines
        text = text.replace(/;/g, '\n');

        // 9. Fix node labels - ensure proper bracket syntax
        // Convert A[Label] to A["Label"] for safety
        text = text.replace(/(\w+)\[([^\]"]+)\]/g, (match, id, label) => {
            // If label doesn't have quotes, add them
            if (!label.startsWith('"') && !label.endsWith('"')) {
                return `${id}["${label.trim()}"]`;
            }
            return match;
        });

        // 10. Remove common AI explanatory text
        const endMarkers = ['\nNote:', '\nThis diagram', '\nExplanation:', '\nIn this', '\n\n---'];
        for (const marker of endMarkers) {
            const index = text.indexOf(marker);
            if (index !== -1) {
                text = text.substring(0, index);
            }
        }

        // 11. Clean up extra whitespace
        text = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');

        console.log(`[Gemini] Sanitized Mermaid Output (${text.length} chars):\n${text}`);

        // Fallback: if sanitization resulted in empty string, return raw output
        if (!text || text.trim().length === 0) {
            console.warn('[Gemini] Sanitization resulted in empty output, returning raw text');
            text = result.response.text();
        }

        return text.trim();
    } catch (error) {
        console.error("Error generating Mermaid diagram:", error);
        throw error;
    }
}

module.exports = {
    generateEmbedding,
    generateResponse,
    generateMermaidDiagram
};
