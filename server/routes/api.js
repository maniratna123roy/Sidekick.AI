const express = require('express');
const router = express.Router();
const fs = require('fs');

const { cloneRepository, getCodeFiles, chunkCode } = require('../services/repo');
const { generateEmbedding, generateResponse } = require('../services/gemini');
const { storeVectors, searchSimilarChunks } = require('../services/pinecone');

// Index Repository
router.post('/index', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'GitHub URL is required' });

  console.log(`[Indexer] Starting index for: ${url}`);
  try {
    // 1. Clone
    const { localPath, repoName } = await cloneRepository(url);
    console.log(`[Indexer] Cloned to ${localPath}`);

    // 2. Get Files
    const files = await getCodeFiles(localPath);
    console.log(`[Indexer] Found ${files.length} code files`);

    // 3. Process & Embed
    let totalChunks = 0;
    const vectorsToStore = [];

    // Limit files for demo purposes to avoid hitting rate limits immediately
    const distinctFiles = files.slice(0, 50);

    for (const file of distinctFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const chunks = chunkCode(file, content, repoName);

      for (const chunk of chunks) {
        try {
          const embedding = await generateEmbedding(chunk.content);
          vectorsToStore.push({
            id: chunk.id,
            values: embedding,
            metadata: chunk.metadata
          });
          // Rate limit delay
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (embedError) {
          console.error(`[Indexer] Error embedding chunk ${chunk.id}:`, embedError);
        }
      }
      totalChunks += chunks.length;
    }

    // 4. Store in Pinecone
    if (vectorsToStore.length > 0) {
      await storeVectors(vectorsToStore);
    }

    console.log(`[Indexer] Indexed ${totalChunks} chunks`);
    res.json({ message: 'Repository indexed successfully', repo: repoName, stats: { files: files.length, chunks: totalChunks } });

  } catch (error) {
    console.error('[Indexer] Main process failed:', error);
    res.status(500).json({ error: 'Indexing failed', details: error.message });
  }
});

// Chat / Query
router.post('/chat', async (req, res) => {
  const { query, repoName } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  console.log(`[Chat] Query: ${query}, Repo: ${repoName || 'All'}`);

  try {
    // 1. Embed Query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search Pinecone
    const similarChunks = await searchSimilarChunks(queryEmbedding, repoName || undefined);

    // 3. Generate Answer
    const answer = await generateResponse(query, similarChunks);

    res.json({
      answer,
      sources: similarChunks.map(match => ({
        filename: match.metadata.filename,
        score: match.score,
        startLine: match.metadata.startLine,
        endLine: match.metadata.endLine,
        code: match.metadata.content // Optional, might be large
      }))
    });
  } catch (error) {
    console.error('[Chat] Failed:', error);
    res.status(500).json({ error: 'Chat processing failed', details: error.message });
  }
});

module.exports = router;
