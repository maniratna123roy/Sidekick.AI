const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { cloneRepository, getCodeFiles, chunkCode, getDependencyGraph, getRepoFiles, getFileContent } = require('../services/repo');
const { generateEmbedding, generateResponse, generateMermaidDiagram } = require('../services/gemini');
const { storeVectors, searchSimilarChunks } = require('../services/pinecone');
const { getRepositoryAnalytics } = require('../services/analytics');

const REPO_STORAGE_PATH = process.env.REPO_STORAGE_PATH
  ? path.resolve(path.join(__dirname, '..'), process.env.REPO_STORAGE_PATH)
  : path.join(__dirname, '../repos');

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
    // Use higher topK for documentation to provide better context breadth
    const isDocMode = query.includes('DOCUMENTATION MODE');
    const topK = isDocMode ? 15 : 5;

    console.log(`[Chat] TopK for prompt: ${topK}`);
    const similarChunks = await searchSimilarChunks(queryEmbedding, repoName || undefined, topK);

    if (similarChunks.length === 0 && repoName) {
      console.warn(`[Chat] No context found for repo: ${repoName} with query: ${query}`);
    }

    // 3. Generate Answer
    const answer = await generateResponse(query, similarChunks, repoName);

    res.json({
      answer,
      sources: similarChunks.map(match => ({
        filename: match.metadata.filename,
        score: match.score,
        startLine: match.metadata.startLine,
        endLine: match.metadata.endLine,
        code: match.metadata.content
      }))
    });
  } catch (error) {
    console.error('[Chat] Failed:', error);
    res.status(500).json({
      error: 'Chat processing failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/files?repoName=name
router.get('/files', async (req, res) => {
  const { repoName } = req.query;
  if (!repoName) return res.status(400).json({ error: "Repo name required" });

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);
    const files = await getRepoFiles(repoPath);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/file-content?repoName=name&path=relative/path
router.get('/file-content', async (req, res) => {
  const { repoName, path: filePath } = req.query;
  if (!repoName || !filePath) return res.status(400).json({ error: "Repo name and path required" });

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);
    const content = getFileContent(repoPath, filePath);
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/graph?repoName=name
router.get('/graph', async (req, res) => {
  const { repoName } = req.query;
  if (!repoName) return res.status(400).json({ error: "Repo name required" });

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);
    const graph = await getDependencyGraph(repoPath);
    res.json(graph);
  } catch (error) {
    console.error('[Graph] Failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics?repoName=name
router.get('/analytics', async (req, res) => {
  const { repoName } = req.query;
  if (!repoName) return res.status(400).json({ error: "Repo name required" });

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);

    if (!fs.existsSync(repoPath)) {
      const available = fs.existsSync(REPO_STORAGE_PATH) ? fs.readdirSync(REPO_STORAGE_PATH) : 'No repos dir';
      return res.status(404).json({ error: `Repository not found at ${repoPath}. Available: ${JSON.stringify(available)}` });
    }

    const analytics = await getRepositoryAnalytics(repoPath);
    res.json(analytics);
  } catch (error) {
    console.error('[Analytics] Failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/visualize
router.post('/visualize', async (req, res) => {
  const { repoName, filePath, type } = req.body;
  if (!repoName || !filePath) return res.status(400).json({ error: "Repo name and file path required" });

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);
    const content = getFileContent(repoPath, filePath);

    if (!content) throw new Error("File content is empty");

    const diagram = await generateMermaidDiagram(content, type);
    res.json({ diagram });
  } catch (error) {
    console.error('[Visualize] Failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/delete
router.delete('/delete', async (req, res) => {
  const { repoName } = req.body;
  if (!repoName) return res.status(400).json({ error: "Repo name required" });

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);

    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }

    // Also try to clean up Pinecone vectors if possible, but that requires more complex logic.
    // For now, we just delete the files to save space as requested.

    res.json({ message: `Repository ${repoName} deleted successfully` });
  } catch (error) {
    console.error('[Delete] Failed:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
