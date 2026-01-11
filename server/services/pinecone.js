const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME || 'sidekick-code-index';

/**
 * Store vectors in Pinecone
 * @param {Array} vectors - Array of vector objects { id, values, metadata }
 */
async function storeVectors(vectors) {
    const index = pinecone.index(indexName);
    // Pinecone recommends batches of 100 or less
    const batchSize = 50;
    for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
    }
}

/**
 * Search specifically for code chunks
 * @param {number[]} vector - Query embedding
 * @param {string} repoName - Repository to filter by
 * @param {number} topK - Number of results
 * @returns {Promise<Array>} - Array of matches
 */
async function searchSimilarChunks(vector, repoName, topK = 5) {
    const index = pinecone.index(indexName);

    // Pinecone filters are case-sensitive. 
    // We check both the provided name and its lowercase version to catch all variations.
    const filter = repoName
        ? { repoName: { $in: [repoName, repoName.toLowerCase()] } }
        : undefined;

    const queryResponse = await index.query({
        vector: vector,
        topK: topK,
        filter: filter,
        includeMetadata: true,
    });
    return queryResponse.matches;
}

/**
 * Delete all vectors associated with a repository
 * @param {string} repoName 
 */
async function deleteVectorsByRepo(repoName) {
    const index = pinecone.index(indexName);
    try {
        console.log(`[Pinecone] Purging vectors for repo: ${repoName}`);
        // Delete by metadata filter
        await index.deleteMany({
            filter: { repoName: { $in: [repoName, repoName.toLowerCase()] } }
        });
        console.log(`[Pinecone] Purge complete for: ${repoName}`);
    } catch (error) {
        console.error(`[Pinecone] Purge failed for ${repoName}:`, error);
        // We don't throw here to avoid blocking the file deletion if Pinecone fails
    }
}

module.exports = {
    storeVectors,
    searchSimilarChunks,
    deleteVectorsByRepo
};
