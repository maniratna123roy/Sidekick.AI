import { useEffect, useState, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Share2, Loader2, ZoomIn, ZoomOut, RefreshCw, X, FileCode, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';

interface GraphNode {
    id: string;
    label: string;
    type: 'file' | 'folder';
    parent?: string;
}

interface GraphLink {
    source: string;
    target: string;
}

const KnowledgeGraph = ({ repoName, repoId, repoUrl }: { repoName: string, repoId?: string, repoUrl?: string }) => {
    const [rawTree, setRawTree] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [readingVisible, setReadingVisible] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [tookTooLong, setTookTooLong] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const fgRef = useRef<any>();

    useEffect(() => {
        const fetchFiles = async () => {
            if (!repoName) return;
            setLoading(true);
            setTookTooLong(false);

            const timeout = setTimeout(() => {
                if (loading) setTookTooLong(true);
            }, 3000);

            try {
                const response = await api.getFiles(repoName, repoId);
                const files = response.files;

                if ((!files || files.length === 0) && repoUrl && !restoring) {
                    throw new Error('Repository context not found');
                }

                const nodes: GraphNode[] = [];
                const links: GraphLink[] = [];
                const seenPaths = new Set<string>();

                nodes.push({ id: 'root', label: repoName, type: 'folder' });
                seenPaths.add('root');

                files.forEach((path: string) => {
                    const parts = path.split('/');
                    let previousPath = 'root';

                    parts.forEach((part, index) => {
                        const isLast = index === parts.length - 1;
                        const nodeId = parts.slice(0, index + 1).join('/');

                        if (!seenPaths.has(nodeId)) {
                            nodes.push({
                                id: nodeId,
                                label: part,
                                type: isLast ? 'file' : 'folder',
                                parent: previousPath
                            });
                            links.push({
                                source: previousPath,
                                target: nodeId
                            });
                            seenPaths.add(nodeId);
                        }
                        previousPath = nodeId;
                    });
                });

                setRawTree({ nodes, links });
                setExpandedFolders(new Set(['root']));
                setError(null);
            } catch (err: any) {
                const isNotFoundError = err.message && (
                    err.message.toLowerCase().includes('not found') ||
                    err.message.toLowerCase().includes('context not found')
                );

                if (isNotFoundError && repoUrl) {
                    setRestoring(true);
                    try {
                        await api.indexRepo(repoUrl);
                        setRetryCount(prev => prev + 1);
                    } catch (restoreError: any) {
                        setError(`Restoration failed: ${restoreError.message}`);
                    } finally {
                        setRestoring(false);
                    }
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
                clearTimeout(timeout);
            }
        };

        fetchFiles();
    }, [repoName, repoId, retryCount]);

    // Compute visible nodes based on expansion state
    const visibleData = useMemo(() => {
        const nodes = rawTree.nodes.filter(node => {
            if (node.id === 'root') return true;

            // A Folder is visible if its parent is 'root' (top level) OR if its parent is expanded
            if (node.type === 'folder') {
                if (node.parent === 'root') return true;
                return expandedFolders.has(node.parent || 'root');
            }

            // A File is ONLY visible if its parent folder has been explicitly expanded by the user
            if (node.type === 'file') {
                return expandedFolders.has(node.parent || 'root');
            }

            return false;
        });

        const activeNodeIds = new Set(nodes.map(n => n.id));
        const links = rawTree.links.filter(link => {
            const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
            const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
            return activeNodeIds.has(sourceId) && activeNodeIds.has(targetId);
        });

        return { nodes, links };
    }, [rawTree, expandedFolders]);

    const handleNodeClick = async (node: any) => {
        if (node.type === 'folder') {
            const newExpanded = new Set(expandedFolders);
            if (newExpanded.has(node.id)) {
                newExpanded.delete(node.id);
            } else {
                newExpanded.add(node.id);
            }
            setExpandedFolders(newExpanded);
            return;
        }

        setSelectedFile(node.id);
        setReadingVisible(true);
        setFileContent(null);
        try {
            const response = await api.getFileContent(repoName, node.id, repoId);
            setFileContent(response.content);
        } catch (err) {
            setFileContent("Error loading file content.");
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm relative z-20">
                <div className="glass-panel p-12 rounded-3xl border-white/5 bg-black/40 text-center space-y-6 max-w-sm">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
                        <Loader2 className="w-12 h-12 text-primary animate-spin relative mx-auto" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">{restoring ? 'Restoring Architecture...' : 'Mapping Codebase...'}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {restoring ? 'Retrieving code structure from source...' : 'AI is decoding your repository to build the dependency map.'}
                        </p>
                    </div>
                    {tookTooLong && (
                        <div className="pt-2 animate-in fade-in slide-in-from-bottom-4">
                            <p className="text-[10px] text-amber-500 font-mono uppercase mb-4 tracking-tighter">Took longer than 3s...</p>
                            <Button
                                size="sm"
                                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                onClick={() => setRetryCount(prev => prev + 1)}
                            >
                                Force Restoration
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-destructive" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Tree Construction Failed</h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry Analysis</Button>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative group flex">
            <div className="flex-1 relative overflow-hidden">
                {/* Controls HUD */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <div className="glass-panel bg-black/40 p-1 rounded-xl border border-white/5 flex flex-col gap-1 backdrop-blur-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/20" onClick={() => fgRef.current?.zoomIn()}>
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/20" onClick={() => fgRef.current?.zoomOut()}>
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/20" onClick={() => fgRef.current?.centerAt(0, 0, 1000)}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="glass-panel bg-black/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-md flex items-center gap-2">
                        <div className="flex items-center gap-2 pr-2 border-r border-white/10">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-mono text-slate-300 uppercase tracking-tighter">Repository: {repoName}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] font-mono uppercase text-muted-foreground hover:text-white"
                            onClick={() => {
                                setRetryCount(prev => prev + 1);
                                setRawTree({ nodes: [], links: [] });
                            }}
                        >
                            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} />
                            Repair
                        </Button>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 z-10 glass-panel bg-black/40 px-3 py-2 rounded-lg border border-white/5 text-[10px] font-mono text-muted-foreground flex gap-4 backdrop-blur-md">
                    <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Folders
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-violet-500" /> Files
                    </div>
                    <div className="text-[9px] border-l border-white/10 pl-3 ml-1 text-primary/80">Click folders to expand</div>
                </div>

                <ForceGraph2D
                    ref={fgRef}
                    graphData={visibleData}
                    nodeLabel="id"
                    nodeAutoColorBy="type"
                    linkColor={(link: any) => {
                        if (link.source.type === 'folder') return 'rgba(34, 197, 94, 0.4)';
                        return 'rgba(236, 72, 153, 0.4)';
                    }}
                    linkDirectionalArrowLength={4}
                    linkDirectionalArrowRelPos={1}
                    d3AlphaDecay={0.02}
                    d3VelocityDecay={0.4}
                    cooldownTicks={100}
                    onEngineStop={() => {
                        fgRef.current?.zoomToFit(400, 100);
                    }}
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.label.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
                        const fontSize = 14 / globalScale;
                        ctx.font = `italic ${fontSize}px "TeX Gyre Termes", serif`;

                        const textWidth = ctx.measureText(label).width;
                        const pillHeight = 22 / globalScale;
                        const isExpanded = expandedFolders.has(node.id);

                        // Width adjustment for icons and potential expansion markers
                        const pillWidth = textWidth + (node.type === 'folder' ? 45 : 30) / globalScale;

                        // 1. Draw Inner Glow / Shadow
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                        ctx.shadowBlur = 8 / globalScale;

                        // 2. Draw Main Pill Background
                        ctx.fillStyle = node.type === 'folder' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(30, 41, 59, 0.9)';

                        // Border color depends on type and expansion state
                        let borderColor = node.type === 'folder' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(139, 92, 246, 0.8)';
                        if (node.type === 'folder' && !isExpanded) borderColor = 'rgba(34, 197, 94, 0.3)';

                        ctx.strokeStyle = borderColor;
                        ctx.lineWidth = 1.5 / globalScale;

                        ctx.beginPath();
                        const x = node.x - pillWidth / 2;
                        const y = node.y - pillHeight / 2;
                        ctx.roundRect(x, y, pillWidth, pillHeight, 6 / globalScale);
                        ctx.fill();
                        ctx.stroke();
                        ctx.shadowBlur = 0; // Reset shadow

                        // 3. Draw Icon Area Background
                        ctx.fillStyle = node.type === 'folder' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(139, 92, 246, 0.2)';
                        ctx.beginPath();
                        ctx.roundRect(x + 2 / globalScale, y + 2 / globalScale, (pillHeight - 4 / globalScale), pillHeight - 4 / globalScale, 4 / globalScale);
                        ctx.fill();

                        // 4. Draw Icons
                        ctx.fillStyle = node.type === 'folder' ? '#4ade80' : '#a78bfa';
                        if (node.type === 'folder') {
                            ctx.beginPath();
                            ctx.moveTo(x + 6 / globalScale, y + 8 / globalScale);
                            ctx.lineTo(x + 10 / globalScale, y + 8 / globalScale);
                            ctx.lineTo(x + 12 / globalScale, y + 10 / globalScale);
                            ctx.lineTo(x + 18 / globalScale, y + 10 / globalScale);
                            ctx.lineTo(x + 18 / globalScale, y + 16 / globalScale);
                            ctx.lineTo(x + 6 / globalScale, y + 16 / globalScale);
                            ctx.closePath();
                            ctx.fill();

                            // Expansion Indicator (+/-)
                            ctx.fillStyle = '#f8fafc';
                            ctx.font = `bold ${10 / globalScale}px Arial`;
                            ctx.textAlign = 'center';
                            ctx.fillText(isExpanded ? '-' : '+', x + pillWidth - 10 / globalScale, node.y);
                        } else {
                            ctx.beginPath();
                            ctx.rect(x + 8 / globalScale, y + 6 / globalScale, 8 / globalScale, 10 / globalScale);
                            ctx.fill();
                        }

                        // 5. Draw Text Label
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = node.type === 'folder' && !isExpanded ? '#94a3b8' : '#f8fafc';
                        ctx.font = `italic ${fontSize}px "TeX Gyre Termes", serif`;
                        ctx.fillText(label, x + pillHeight + 2 / globalScale, node.y);
                    }}
                    onNodeClick={handleNodeClick}
                />
            </div>

            {/* Side Preview Panel */}
            {readingVisible && (
                <div className="w-[500px] border-l border-white/5 bg-black/60 backdrop-blur-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2 truncate pr-4">
                            <FileCode className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-xs font-mono text-slate-300 truncate">{selectedFile}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setReadingVisible(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {fileContent === null ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <p className="text-[10px] font-mono uppercase tracking-widest">Decrypting code...</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <pre className="text-[11px] font-mono leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 overflow-x-auto text-slate-400">
                                    <code>{fileContent}</code>
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeGraph;
