const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

/**
 * Helper to retry API calls with exponential backoff
 */
async function withRetry(fn, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimit = error.message?.includes('429') || error.status === 429;
            if (isRateLimit && i < retries - 1) {
                console.warn(`[Gemini] Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue;
            }
            throw error;
        }
    }
}

/**
 * Generate embedding for a given text
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - The embedding vector
 */
async function generateEmbedding(text) {
    try {
        return await withRetry(async () => {
            const result = await embeddingModel.embedContent(text);
            return result.embedding.values;
        });
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
        const isDocMode = query.includes('DOCUMENTATION MODE');
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
${isDocMode
                ? "You are currently in DOCUMENTATION MODE. Goal: Generate comprehensive, high-level technical documentation."
                : "Goal: Answer the user's question precisely based on the provided code context."}

GUIDELINES:
1. CITATIONS: Whenever you reference code, provide a markdown link like [filename:L123](https://github.com/REPO_PLACEHOLDER/blob/main/filename#L123).
2. DIAGRAMS: If explaining a flow, architecture, or state change, ALWAYS include a Mermaid.js diagram using \`\`\`mermaid blocks.
3. CONTEXT USAGE: ${isDocMode
                ? "Use the provided context to build the documentation. If specific details are missing, provides a best-guess technical overview or explain what should be there based on standard patterns."
                : "Answer ONLY based on the provided code context. If the answer is not in the context, say so."}
4. LANGUAGE: Respond in the language used by the user.

Context:
${contextChunks.length > 0 ? contextText : "NO SPECIFIC CODE CONTEXT FOUND FOR THIS REPOSITORY."}

Question: ${query}
`;

        const result = await withRetry(async () => {
            return await model.generateContent(prompt);
        });
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
        let specificRules = '';
        let exampleFormat = '';

        if (type === 'flowchart') {
            specificRules = `
        FLOWCHART-SPECIFIC RULES:
        - ALWAYS use "flowchart TD" (NOT "graph TD")
        - Use ONLY "-->" for arrows. NEVER use "->" or "==>"
        - Node IDs must be alphanumeric (A-Z, a-z, 0-9, underscore)
        - Node labels MUST be in square brackets with quotes: NodeID["Label Text"]
        - Use curly braces for decision nodes: Decision{"Question?"}
            `;
            exampleFormat = `
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
            `;
        } else if (type === 'sequence') {
            specificRules = `
        SEQUENCE DIAGRAM RULES:
        - Start with "sequenceDiagram"
        - Use "participant Name" to declare participants
        - Use "->" or "->>" for synchronous calls
        - Use "-->" or "-->>" for asynchronous/return calls
        - Use "activate" and "deactivate" for lifelines
        - Format: Participant1->>Participant2: Message text
            `;
            exampleFormat = `
        EXAMPLE FORMAT:
        sequenceDiagram
            participant User
            participant API
            participant Database
            
            User->>API: Request data
            activate API
            API->>Database: Query
            activate Database
            Database-->>API: Results
            deactivate Database
            API-->>User: Response
            deactivate API
            `;
        } else if (type === 'class') {
            specificRules = `
        CLASS DIAGRAM RULES:
        - Start with "classDiagram"
        - Use "class ClassName" to define classes
        - Use "+method()" for public, "-method()" for private
        - Use inheritance: ClassA <|-- ClassB
        - Use composition: ClassA *-- ClassB
            `;
            exampleFormat = `
        EXAMPLE FORMAT:
        classDiagram
            class Animal {
                +String name
                +int age
                +makeSound()
            }
            class Dog {
                +bark()
            }
            Animal <|-- Dog
            `;
        }

        const prompt = `
        Analyze the following code and generate a Mermaid.js ${type} diagram.
        
        CRITICAL RULES FOR MERMAID v11+ COMPATIBILITY:
        1. Return ONLY the raw Mermaid.js syntax - NO explanations, NO markdown blocks.
        2. START directly with the diagram type.
        3. Each statement on a new line. NO semicolons.
        4. Keep it simple - max 10-15 nodes/participants for readability.
        5. Use proper indentation for readability.
        6. Escape special characters in labels: use &quot; for quotes, &amp; for ampersand.
        
        ${specificRules}
        ${exampleFormat}

        CODE TO ANALYZE:
        ${codeContent}
        `;

        const result = await withRetry(async () => {
            return await model.generateContent(prompt);
        });
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

        // 7. Fix arrow syntax ONLY for flowcharts (not sequence diagrams)
        const isFlowchart = text.toLowerCase().startsWith('flowchart');
        if (isFlowchart) {
            text = text.replace(/(\w+)\s+->\s+(\w+)/g, '$1 --> $2');
            text = text.replace(/(\w+)\s+==>\s+(\w+)/g, '$1 --> $2');
        }

        // 8. Replace semicolons with newlines
        text = text.replace(/;/g, '\n');

        // 9. Fix node labels - ensure proper bracket syntax (ONLY for flowcharts)
        // Convert A[Label] to A["Label"] for safety
        if (isFlowchart) {
            text = text.replace(/(\w+)\[([^\]"]+)\]/g, (match, id, label) => {
                // If label doesn't have quotes, add them
                if (!label.startsWith('"') && !label.endsWith('"')) {
                    return `${id}["${label.trim()}"]`;
                }
                return match;
            });
        }

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
