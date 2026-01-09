import { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Share2, Loader2, Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const KnowledgeGraph = ({ repoName }: { repoName: string }) => {
    const [data, setData] = useState<any>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fgRef = useRef<any>();

    useEffect(() => {
        const fetchGraph = async () => {
            if (!repoName) return;
            setLoading(true);
            try {
                const graph = await api.getGraph(repoName);
                // Transform api data for force-graph (edges -> links)
                setData({
                    nodes: graph.nodes,
                    links: graph.edges
                });
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGraph();
    }, [repoName]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Mapping Codebase Architecture...</p>
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
                    <h3 className="font-bold text-lg">Graph Analysis Failed</h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry Analysis</Button>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative group">
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
            </div>

            <div className="absolute bottom-4 right-4 z-10 glass-panel bg-black/40 px-3 py-2 rounded-lg border border-white/5 text-[10px] font-mono text-muted-foreground flex gap-4 backdrop-blur-md">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary" /> Files
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full border border-primary/50" /> Imports
                </div>
            </div>

            <ForceGraph2D
                ref={fgRef}
                graphData={data}
                nodeLabel="label"
                nodeAutoColorBy="id"
                linkColor={() => 'rgba(255, 255, 255, 0.1)'}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.label.split('/').pop();
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Inter`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.beginPath();
                    ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1], 2);
                    ctx.fill();

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.color;
                    ctx.fillText(label, node.x, node.y);

                    // Node circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();
                }}
                onNodeClick={(node: any) => {
                    console.log('Clicked:', node);
                    // Future: Open file preview
                }}
                cooldownTicks={100}
                d3VelocityDecay={0.3}
            />
        </div>
    );
};

export default KnowledgeGraph;
