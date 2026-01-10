const simpleGit = require('simple-git');
const { glob } = require('glob');
const fs = require('fs');
const path = require('path');

const REPO_STORAGE_PATH = process.env.REPO_STORAGE_PATH
    ? path.resolve(path.join(__dirname, '..'), process.env.REPO_STORAGE_PATH)
    : path.join(__dirname, '../repos');

// Ensure storage path exists
if (!fs.existsSync(REPO_STORAGE_PATH)) {
    fs.mkdirSync(REPO_STORAGE_PATH, { recursive: true });
}

/**
 * Clone a repository
 * @param {string} repoUrl - GitHub URL
 * @returns {Promise<string>} - Path to cloned repo
 */
async function cloneRepository(repoUrl) {
    // Extract repo name from URL (e.g., https://github.com/user/repo.git -> user_repo)
    const repoName = repoUrl.split('/').slice(-2).join('_').replace('.git', '');
    const localPath = path.join(REPO_STORAGE_PATH, repoName);

    if (fs.existsSync(localPath)) {
        // If exists, pull latest
        const git = simpleGit(localPath);
        await git.pull();
    } else {
        // Clone new
        await simpleGit().clone(repoUrl, localPath);
    }

    return { localPath, repoName };
}

/**
 * Get all code files from a directory
 * @param {string} directory - Directory path
 * @returns {Promise<string[]>} - Array of file paths
 */
async function getCodeFiles(directory) {
    // Basic glob to find code files, ignoring node_modules, etc.
    const pattern = '**/*.{js,jsx,ts,tsx,py,java,cpp,c,h,cs,go,rs,rb,php}';
    const options = {
        cwd: directory,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        nodir: true,
        absolute: true
    };

    return await glob(pattern, options);
}


/**
 * Naive chunker: breaks file into chunks based on line numbers
 * Ideally this uses AST parsing, but for MVP we use windowing
 */
function chunkCode(filePath, content, repoName) {
    const lines = content.split('\n');
    const chunks = [];
    const chunkSize = 50; // lines
    const overlap = 10;

    for (let i = 0; i < lines.length; i += (chunkSize - overlap)) {
        const chunkLines = lines.slice(i, i + chunkSize);
        if (chunkLines.length < 5) continue; // Skip tiny chunks

        const chunkContent = chunkLines.join('\n');
        const startLine = i + 1;
        const endLine = i + chunkLines.length;

        // ID format: repo::filename::startLine-endLine
        const relativePath = path.relative(REPO_STORAGE_PATH, filePath).split(path.sep).slice(1).join('/'); // remove repo folder from path
        const id = `${repoName}::${relativePath}::${startLine}-${endLine}`;

        chunks.push({
            id: id.replace(/[^a-zA-Z0-9-_]/g, '_'), // sanitizing ID for Pinecone
            content: chunkContent,
            metadata: {
                repoName,
                filename: relativePath,
                startLine,
                endLine,
                content: chunkContent
            }
        });

        if (i + chunkSize >= lines.length) break;
    }

    return chunks;
}

/**
 * Simple dependency extraction using regex for JS/TS
 * @param {string} repoPath 
 * @returns {Promise<Object>} - Nodes and Edges for graph
 */
async function getDependencyGraph(repoPath) {
    const files = await glob('**/*.{js,ts,jsx,tsx}', {
        cwd: repoPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    const nodes = [];
    const edges = [];
    const fileToId = new Map();

    // Create nodes
    files.forEach((file, index) => {
        const id = `n${index}`;
        nodes.push({ id, label: file, path: file });
        fileToId.set(file, id);
    });

    // Extract basic imports
    for (const file of files) {
        const fullPath = path.join(repoPath, file);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const sourceId = fileToId.get(file);

        // Match import { ... } from './path' or import './path'
        const importRegex = /from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1] || match[2];
            if (importPath && importPath.startsWith('.')) {
                // Try to resolve the path
                const resolved = path.join(path.dirname(file), importPath).replace(/\\/g, '/');
                // Basic matching (ignoring extension diffs for now)
                for (const [targetPath, targetId] of fileToId.entries()) {
                    if (targetPath.startsWith(resolved)) {
                        edges.push({ source: sourceId, target: targetId });
                        break;
                    }
                }
            }
        }
    }

    return { nodes, edges };
}

/**
 * List all files in the repository (excluding ignored)
 * @param {string} repoPath 
 * @returns {Promise<string[]>}
 */
async function getRepoFiles(repoPath) {
    const files = await glob('**/*', {
        cwd: repoPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        nodir: true
    });
    return files;
}

/**
 * Get content of a specific file
 * @param {string} repoPath 
 * @param {string} relativePath 
 * @returns {string}
 */
function getFileContent(repoPath, relativePath) {
    const fullPath = path.join(repoPath, relativePath);
    if (!fs.existsSync(fullPath)) throw new Error("File not found");
    return fs.readFileSync(fullPath, 'utf-8');
}

module.exports = {
    cloneRepository,
    getCodeFiles,
    chunkCode,
    getDependencyGraph,
    getRepoFiles,
    getFileContent
};
