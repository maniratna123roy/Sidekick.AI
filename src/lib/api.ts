export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    },

    getGraph: async (repoName: string) => {
        const response = await fetch(`${API_URL}/graph?repoName=${repoName}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || 'Failed to fetch graph');
        }
        return response.json();
    },

    getFiles: async (repoName: string) => {
        const response = await fetch(`${API_URL}/files?repoName=${repoName}`);
        if (!response.ok) throw new Error('Failed to fetch files');
        return response.json();
    },

    getFileContent: async (repoName: string, path: string) => {
        const response = await fetch(`${API_URL}/file-content?repoName=${repoName}&path=${encodeURIComponent(path)}`);
        if (!response.ok) throw new Error('Failed to fetch file content');
        return response.json();
    },

    getAnalytics: async (repoName: string) => {
        const response = await fetch(`${API_URL}/analytics?repoName=${repoName}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || 'Failed to fetch analytics');
        }
        return response.json();
    },

    visualizeCode: async (repoName: string, filePath: string, type: string) => {
        const response = await fetch(`${API_URL}/visualize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repoName, filePath, type }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || 'Visualization failed');
        }
        return response.json();
    },

    deleteRepo: async (repoName: string) => {
        const response = await fetch(`${API_URL}/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repoName }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || 'Deletion failed');
        }
        return response.json();
    }
};
