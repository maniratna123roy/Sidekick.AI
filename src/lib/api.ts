export const API_URL = 'http://localhost:3001/api';

export const api = {
    indexRepo: async (url: string) => {
        const response = await fetch(`${API_URL}/index`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || 'Indexing failed');
        }
        return response.json();
    },

    chat: async (query: string, repoName?: string) => {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, repoName }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || 'Chat failed');
        }
        return response.json();
    }
};
