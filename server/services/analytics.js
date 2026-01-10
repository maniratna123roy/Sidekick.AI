const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

/**
 * Perform repository analytics
 */
async function getRepositoryAnalytics(repoPath) {
    const git = simpleGit(repoPath);

    // 1. Language Distribution & File Size
    const stats = await getFileStats(repoPath);

    // 2. Complexity Analysis
    const complexity = await analyzeComplexity(repoPath, stats.files);

    // 3. Git Metrics
    const gitMetrics = await getGitMetrics(git);

    return {
        languages: stats.languages,
        fileSizes: stats.fileSizes,
        complexity,
        gitMetrics,
        totalFiles: stats.files.length,
        totalLoC: stats.totalLoC
    };
}

async function getFileStats(repoPath) {
    const { glob } = require('glob');
    const files = await glob('**/*.{js,jsx,ts,tsx,py,java,cpp,c,h,cs,go,rs,rb,php}', {
        cwd: repoPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        nodir: true,
        absolute: true
    });

    const languages = {};
    const fileSizes = [];
    let totalLoC = 0;

    const extToLang = {
        '.js': 'JavaScript', '.jsx': 'JavaScript',
        '.ts': 'TypeScript', '.tsx': 'TypeScript',
        '.py': 'Python',
        '.java': 'Java',
        '.cpp': 'C++', '.c': 'C', '.h': 'C/C++',
        '.cs': 'C#',
        '.go': 'Go',
        '.rs': 'Rust',
        '.rb': 'Ruby',
        '.php': 'PHP'
    };

    for (const file of files) {
        const ext = path.extname(file);
        const lang = extToLang[ext] || 'Other';
        languages[lang] = (languages[lang] || 0) + 1;

        const stat = fs.statSync(file);
        fileSizes.push({
            name: path.basename(file),
            size: stat.size,
            lang
        });

        const content = fs.readFileSync(file, 'utf-8');
        totalLoC += content.split('\n').length;
    }

    return { languages, fileSizes, files, totalLoC };
}

async function analyzeComplexity(repoPath, files) {
    let totalComplexity = 0;
    const fileComplexities = [];

    // Naive cyclomatic complexity: count decision points
    // if, for, while, case, &&, ||, ?
    const decisionPattern = /\b(if|for|while|case|catch)\b|&&|\|\||\?/g;

    // Limit to top 20 largest files to avoid hanging on massive repos
    const sortedFiles = [...files].sort((a, b) => fs.statSync(b).size - fs.statSync(a).size).slice(0, 20);

    for (const file of sortedFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const matches = content.match(decisionPattern);
        const complexity = (matches ? matches.length : 0) + 1;

        totalComplexity += complexity;
        fileComplexities.push({
            name: path.basename(file),
            complexity
        });
    }

    return {
        averageComplexity: files.length > 0 ? (totalComplexity / sortedFiles.length).toFixed(2) : 0,
        topComplexFiles: fileComplexities.sort((a, b) => b.complexity - a.complexity).slice(0, 10)
    };
}

async function getGitMetrics(git) {
    try {
        const log = await git.log();
        const commits = log.all;

        // Commit frequency by day
        const frequency = {};
        commits.forEach(commit => {
            const date = new Date(commit.date).toISOString().split('T')[0];
            frequency[date] = (frequency[date] || 0) + 1;
        });

        // Convert to array for Recharts
        const commitData = Object.entries(frequency)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30); // Last 30 days of activity

        return {
            totalCommits: commits.length,
            commitData,
            lastCommit: commits[0] ? commits[0].date : null,
            contributors: new Set(commits.map(c => c.author_email)).size
        };
    } catch (e) {
        console.error("Git metrics failed:", e);
        return { totalCommits: 0, commitData: [], contributors: 0 };
    }
}

module.exports = { getRepositoryAnalytics };
