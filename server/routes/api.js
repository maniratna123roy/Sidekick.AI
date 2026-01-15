const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const {
  cloneRepository,
  getCodeFiles,
  chunkCode,
  getDependencyGraph,
  getRepoFiles,
  getFileContent,
  syncRepoToDatabase
} = require('../services/repo');
const { supabase } = require('../services/supabase');
const { generateEmbedding, generateResponse, generateMermaidDiagram } = require('../services/gemini');
const { storeVectors, searchSimilarChunks, deleteVectorsByRepo } = require('../services/pinecone');
const { getRepositoryAnalytics } = require('../services/analytics');

const REPO_STORAGE_PATH = process.env.REPO_STORAGE_PATH
  ? path.resolve(path.join(__dirname, '..'), process.env.REPO_STORAGE_PATH)
  : path.join(__dirname, '../repos');

// Index Repository
router.post('/index', async (req, res) => {
  const { url, userId } = req.body;
  if (!url) return res.status(400).json({ error: 'GitHub URL is required' });

  console.log(`[Indexer] Starting index for: ${url}`);
  try {
    // 1. Clone
    const { localPath, repoName } = await cloneRepository(url);
    console.log(`[Indexer] Cloned to ${localPath}`);

    // 2. Fetch or Create Record in Supabase to get repoId
    let repoId;
    if (userId) {
      const { data: existing, error: fetchError } = await supabase
        .from('indexed_repositories')
        .select('id')
        .eq('user_id', userId)
        .eq('repo_name', repoName)
        .maybeSingle();

      if (existing) {
        repoId = existing.id;
      } else {
        const { data: created, error: createError } = await supabase
          .from('indexed_repositories')
          .insert([{
            user_id: userId,
            repo_name: repoName,
            repo_url: url,
            is_active: true
          }])
          .select()
          .single();

        if (createError) {
          console.error('[Indexer] Failed to create repo record:', createError.message);
        } else {
          repoId = created.id;
        }
      }
    }

    // 3. Sync to Database (Permanent Storage)
    if (repoId) {
      await syncRepoToDatabase(repoId, localPath);
    }

    // 4. Get Files for Vector Indexing
    const files = await getCodeFiles(localPath);
    console.log(`[Indexer] Found ${files.length} code files`);

    // 5. Process & Embed
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

    // 6. Store in Pinecone
    if (vectorsToStore.length > 0) {
      await storeVectors(vectorsToStore);
    }

    console.log(`[Indexer] Indexed ${totalChunks} chunks`);
    res.json({ message: 'Repository indexed successfully', repo: repoName, repoId, stats: { files: files.length, chunks: totalChunks } });

  } catch (error) {
    console.error('[Indexer] Main process failed:', error);
    res.status(500).json({ error: 'Indexing failed', details: error.message });
  }
});

// Chat / Query
router.post('/chat', async (req, res) => {
  let { query, repoName } = req.body;
  if (repoName) repoName = repoName.toLowerCase();
  if (!query) return res.status(400).json({ error: 'Query is required' });

  console.log(`[Chat] Query: ${query}, Repo: ${repoName || 'All'}`);

  try {
    // 1. Embed Query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search Pinecone
    // Use slightly higher topK for documentation but keep it manageable for speed (avoid Vercel timeouts)
    const isDocMode = query.includes('DOCUMENTATION MODE');
    const topK = isDocMode ? 10 : 5;

    console.log(`[Chat] TopK for prompt: ${topK}`);
    const similarChunks = await searchSimilarChunks(queryEmbedding, repoName || undefined, topK);

    console.log(`[Chat] Found ${similarChunks.length} chunks for ${repoName}`);

    if (similarChunks.length === 0 && repoName) {
      console.warn(`[Chat] No context found for repo: ${repoName}. This will result in a generic response.`);
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

// GET /api/files?repoName=name&repoId=id
router.get('/files', async (req, res) => {
  let { repoName, repoId } = req.query;
  if (!repoName) return res.status(400).json({ error: "Repo name required" });
  repoName = repoName.toLowerCase();

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);
    const files = await getRepoFiles(repoPath, repoId);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/file-content?repoName=name&path=relative/path&repoId=id
router.get('/file-content', async (req, res) => {
  let { repoName, path: filePath, repoId } = req.query;
  if (!repoName || !filePath) return res.status(400).json({ error: "Repo name and path required" });
  repoName = repoName.toLowerCase();

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);
    const content = await getFileContent(repoPath, filePath, repoId);
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/graph?repoName=name&repoId=id
router.get('/graph', async (req, res) => {
  let { repoName, repoId } = req.query;
  if (!repoName) return res.status(400).json({ error: "Repo name required" });
  repoName = repoName.toLowerCase();

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);

    // Check if repo exists on disk, if not, we might need a DB-backed graph generator
    // For now, if it's missing from disk but we have a repoId, we can't easily generate the graph 
    // unless we re-clone or store the graph itself.
    // Optimization: Fallback to disk, but ideally graph should be generated from DB files if disk is wiped.

    const graph = await getDependencyGraph(repoPath);
    res.json(graph);
  } catch (error) {
    console.error('[Graph] Failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics?repoName=name
router.get('/analytics', async (req, res) => {
  let { repoName } = req.query;
  if (!repoName) return res.status(400).json({ error: "Repo name required" });
  repoName = repoName.toLowerCase();

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
  let { repoName, filePath, type, repoId } = req.body;
  if (!repoName || !filePath) return res.status(400).json({ error: "Repo name and file path required" });
  repoName = repoName.toLowerCase();

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);
    const content = await getFileContent(repoPath, filePath, repoId);

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
  let { repoName, repoId } = req.body;
  if (!repoName) return res.status(400).json({ error: "Repo name required" });
  repoName = repoName.toLowerCase();

  try {
    const repoPath = path.join(REPO_STORAGE_PATH, repoName);

    // 1. Clean up local files
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }

    // 2. Clean up Pinecone vectors
    await deleteVectorsByRepo(repoName);

    // 3. Clean up Supabase (Permanent Storage)
    if (repoId) {
      // Deleting from indexed_repositories will cascade to repository_files
      await supabase
        .from('indexed_repositories')
        .delete()
        .eq('id', repoId);
    } else {
      // Fallback to name if ID not provided (though ID is preferred)
      await supabase
        .from('indexed_repositories')
        .delete()
        .eq('repo_name', repoName);
    }

    res.json({ message: `Repository ${repoName} deleted successfully` });
  } catch (error) {
    console.error('[Delete] Failed:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
