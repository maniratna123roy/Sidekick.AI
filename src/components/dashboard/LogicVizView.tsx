import { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { api } from '@/lib/api';
import { Loader2, Share2, FileCode, GitBranch, Activity, Layers, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'JetBrains Mono, monospace',
    suppressErrorRendering: true,
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
    }
});

const LogicVizView = ({ repoName }: { repoName: string }) => {
    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [diagramType, setDiagramType] = useState<'flowchart' | 'sequence' | 'class'>('flowchart');
    const [diagram, setDiagram] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isFetchingFiles, setIsFetchingFiles] = useState(true);
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchFiles = async () => {
            if (!repoName) return;
            setIsFetchingFiles(true);
            try {
                const response = await api.getFiles(repoName);
                setFiles(response.files || []);
            } catch (err: any) {
                toast.error("Failed to load repository files");
            } finally {
                setIsFetchingFiles(false);
            }
        };
        fetchFiles();
    }, [repoName]);

    const handleGenerate = async () => {
        if (!selectedFile) {
            toast.error("Please select a file first");
            return;
        }
        setLoading(true);
        setDiagram('');

        try {
            const result = await api.visualizeCode(repoName, selectedFile, diagramType);
            console.log('[LogicViz] API Response:', result);
            console.log('[LogicViz] Diagram length:', result.diagram?.length || 0);
            console.log('[LogicViz] Diagram content:', result.diagram);

            if (result.diagram && result.diagram.trim().length > 0) {
                setDiagram(result.diagram);
                toast.success("Diagram generated successfully");
            } else {
                toast.error("AI returned an empty diagram. Try a smaller file.");
            }
        } catch (err: any) {
            toast.error(`Visualization failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const containerId = 'mermaid-container-' + Math.random().toString(36).substr(2, 9);

    useEffect(() => {
        const renderDiagram = async () => {
            console.log('[LogicViz] Render useEffect triggered, diagram:', diagram);
            if (diagram && mermaidRef.current) {
                console.log('[LogicViz] Attempting to render diagram...');
                try {
                    // First, validate the syntax
                    const parseResult = await mermaid.parse(diagram);
                    console.log('[LogicViz] Syntax validation passed:', parseResult);

                    // Then render
                    const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
                    console.log('[LogicViz] Calling mermaid.render with id:', id);
                    const { svg } = await mermaid.render(id, diagram);
                    console.log('[LogicViz] Mermaid render successful, SVG length:', svg.length);
                    mermaidRef.current.innerHTML = svg;
                    toast.success("Visualization rendered");
                } catch (e: any) {
                    console.error("[LogicViz] Mermaid render error:", e);
                    console.log("[LogicViz] Failed diagram syntax:", diagram);

                    // Show the raw syntax for debugging
                    if (mermaidRef.current) {
                        mermaidRef.current.innerHTML = `
                            <div class="text-left p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p class="text-red-400 font-mono text-xs mb-2">❌ Mermaid Syntax Error</p>
                                <pre class="text-xs text-white/70 overflow-auto max-h-96 whitespace-pre-wrap">${diagram}</pre>
                                <p class="text-xs text-muted-foreground mt-2">Error: ${e.message || 'Invalid syntax'}</p>
                            </div>
                        `;
                    }
                    toast.error("Invalid Mermaid syntax. Check the error box above.");
                }
            } else {
                console.log('[LogicViz] Skipping render - diagram:', !!diagram, 'ref:', !!mermaidRef.current);
            }
        };
        renderDiagram();
    }, [diagram]);

    const downloadSVG = () => {
        if (!mermaidRef.current) return;
        const svg = mermaidRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `${selectedFile.split('/').pop()}-${diagramType}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505]">
            <div className="p-8 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">Logic Visualization</h1>
                        <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            AI Diagram Engine
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono uppercase text-muted-foreground ml-1">Select logic source</label>
                            <select
                                value={selectedFile}
                                onChange={(e) => setSelectedFile(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:ring-1 ring-primary outline-none min-w-[200px]"
                                disabled={isFetchingFiles || loading}
                            >
                                <option value="" disabled>Choose a file...</option>
                                {files.map(file => (
                                    <option key={file} value={file} className="bg-[#0f0f0f]">{file}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono uppercase text-muted-foreground ml-1">Diagram type</label>
                            <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                                {[
                                    { id: 'flowchart', icon: Share2 },
                                    { id: 'sequence', icon: GitBranch },
                                    { id: 'class', icon: Layers },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setDiagramType(type.id as any)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all",
                                            diagramType === type.id ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-white/5 text-muted-foreground"
                                        )}
                                    >
                                        <type.icon className="w-3 h-3" />
                                        {type.id}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={!selectedFile || loading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground self-end"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                            {loading ? "Analyzing..." : "Visualize"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative p-8">
                <AnimatePresence>
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10"
                        >
                            <div className="relative">
                                <div className="w-24 h-24 border-2 border-primary/20 rounded-full" />
                                <div className="absolute inset-0 w-24 h-24 border-t-2 border-primary rounded-full animate-spin" />
                                <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                            </div>
                            <p className="mt-6 text-xs font-mono uppercase tracking-[0.3em] text-primary animate-pulse">Scanning Code Structure</p>
                            <p className="mt-2 text-[10px] text-muted-foreground font-mono">Gemini is mapping logic paths...</p>
                        </motion.div>
                    ) : !diagram ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-12"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <Share2 className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold text-white/50 mb-2">No Visualization Prepared</h3>
                            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                                Select a file from your repository and choose a diagram type to see the AI auto-generate a structural map.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`viz-${diagram.substring(0, 50)}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
                                    Generated: {selectedFile}
                                </span>
                                <Button size="sm" variant="outline" onClick={downloadSVG} className="h-8 text-xs gap-2">
                                    <Download className="w-3.5 h-3.5" />
                                    Export SVG
                                </Button>
                            </div>
                            <div className="flex-1 glass-panel rounded-2xl bg-white/5 border-white/5 p-8 overflow-auto flex items-center justify-center">
                                <div
                                    ref={mermaidRef}
                                    className="w-full flex items-center justify-center min-h-[400px]"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LogicVizView;
