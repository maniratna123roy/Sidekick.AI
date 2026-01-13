import { useState, useEffect } from 'react';
import { File, Folder, ChevronRight, ChevronDown, Loader2, Code2 } from 'lucide-react';
import { api } from '@/lib/api';
import MarkdownRenderer from './MarkdownRenderer';
import { cn } from '@/lib/utils';

const FileExplorerView = ({ repoName, allRepos = [], repoId }: { repoName: string, allRepos?: string[], repoId?: string }) => {
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isReadingVisible, setIsReadingVisible] = useState(false);
    const [localRepo, setLocalRepo] = useState<string>(repoName);

    useEffect(() => {
        if (repoName) setLocalRepo(repoName);
    }, [repoName]);

    useEffect(() => {
        const fetchFiles = async () => {
            if (!localRepo) return;
            setLoading(true);
            try {
                const response = await api.getFiles(localRepo, repoId);
                setFiles(response.files.sort());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, [repoName]);

    const handleFileClick = async (path: string) => {
        setSelectedFile(path);
        setIsReadingVisible(true);
        setFileContent(null);
        try {
            const response = await api.getFileContent(localRepo, path, repoId);
            setFileContent(response.content);
        } catch (err) {
            setFileContent("Error loading file content.");
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Indexing File System...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex">
            {/* File Tree */}
            <div className="w-80 border-r border-white/5 flex flex-col bg-black/20 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Repository Files</h3>
                        <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-primary">{files.length}</span>
                    </div>
                    {allRepos.length > 0 && (
                        <select
                            value={localRepo}
                            onChange={(e) => setLocalRepo(e.target.value)}
                            className="w-full text-[10px] font-mono text-muted-foreground uppercase px-2 py-1.5 rounded-lg bg-black/40 border border-white/5 outline-none cursor-pointer hover:border-primary/30 transition-colors"
                        >
                            {allRepos.map(repo => (
                                <option key={repo} value={repo} className="bg-[#0f0f0f]">{repo}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {files.map((path) => (
                        <button
                            key={path}
                            onClick={() => handleFileClick(path)}
                            className={cn(
                                "w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all",
                                selectedFile === path ? "bg-primary/20 text-primary border border-primary/20" : "text-slate-400 hover:bg-white/5"
                            )}
                        >
                            <File className="w-3.5 h-3.5 shrink-0 opacity-50" />
                            <span className="truncate">{path}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 overflow-hidden flex flex-col bg-black/40">
                {selectedFile ? (
                    <>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-primary" />
                                <span className="text-xs font-mono text-slate-300">{selectedFile}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed">
                            {fileContent === null ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin opacity-20" />
                                </div>
                            ) : (
                                <pre className="text-slate-400 p-4 rounded-xl bg-black/20 border border-white/5">
                                    <code className="whitespace-pre">{fileContent}</code>
                                </pre>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                        <Folder className="w-16 h-16" />
                        <p className="font-display text-lg uppercase tracking-widest">Select a file to inspect</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileExplorerView;
