import { useState, useEffect } from 'react';
import { FileText, Book, Code, Shield, HelpCircle, Loader2, Download, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DocumentationHubView = ({ initialRepo: repoName, repoId }: { initialRepo: string | null, repoId?: string }) => {
    const [doc, setDoc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState('architecture');

    const sections = [
        { id: 'architecture', label: 'Architecture Overview', icon: Book },
        { id: 'api', label: 'API Endpoints', icon: Code },
        { id: 'lifecycle', label: 'Request Lifecycle', icon: FileText },
        { id: 'security', label: 'Security & Auth', icon: Shield },
    ];

    const fetchDoc = useCallback(async () => {
        if (!repoName) return;
        setLoading(true);
        setError(null);
        try {
            const response = await api.chat(
                `SYSTEM: DOCUMENTATION MODE. GENERATE A COMPREHENSIVE ${activeSection.toUpperCase()} GUIDE FOR THIS REPOSITORY (${repoName}). USE PROFESSIONAL MARKDOWN FORMATTING WITH HEADERS, LISTS, AND CODE BLOCKS.`,
                repoName,
                repoId
            );
            setDoc(response.answer);
            toast.success("Documentation generated");
        } catch (err: any) {
            console.error("[DocsHub] Generation failed:", err);
            setError(err.message || "Unknown error");
            toast.error("Generation failed");
        } finally {
            setLoading(false);
        }
    }, [repoName, repoId, activeSection]);

    const handleExportPDF = () => {
        if (!doc) return;
        window.print();
    };

    return (
        <div className="h-full flex flex-col md:flex-row">
            {/* Mini Sidebar for Docs */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 p-4 space-y-4">
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">Knowledge Base</h3>
                </div>

                <div className="space-y-1">
                    <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter mb-2 px-2">Sections</h3>
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${activeSection === section.id
                                ? "bg-primary/20 text-primary border border-primary/20"
                                : "text-muted-foreground hover:bg-white/5"
                                }`}
                        >
                            <section.icon className="w-4 h-4" />
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 relative print:p-0 print:overflow-visible bg-[#050505]">
                <div className="max-w-4xl mx-auto">
                    {doc && (
                        <div className="flex justify-end gap-3 mb-8 no-print animate-in fade-in slide-in-from-top-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchDoc}
                                disabled={loading}
                                className="h-9 px-4 border-white/10 hover:bg-white/5 gap-2"
                            >
                                <Sparkles className={cn("w-4 h-4 text-primary", loading && "animate-spin")} />
                                Regenerate
                            </Button>
                            <Button
                                variant="retro-3d"
                                size="sm"
                                onClick={handleExportPDF}
                                className="h-9 px-4 gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </Button>
                        </div>
                    )}

                    {loading ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 no-print">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
                                <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
                            </div>
                            <p className="text-sm font-mono uppercase tracking-widest animate-pulse">Analyzing Codebase...</p>
                            <p className="text-[10px] text-muted-foreground italic">Generating comprehensive documentation guide</p>
                        </div>
                    ) : error ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto no-print">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                <HelpCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white">Generation Failed</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {error.includes('504') || error.includes('timeout')
                                        ? " The AI took too long to analyze this section and the connection timed out. Please try again."
                                        : `Failed to generate documentation: ${error}`}
                                </p>
                            </div>
                            <Button
                                onClick={fetchDoc}
                                variant="retro-3d"
                                className="bg-red-500 hover:bg-red-600 h-10 px-8"
                            >
                                Retry Generation
                            </Button>
                        </div>
                    ) : !doc ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center space-y-8 no-print">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                                <FileText className="w-10 h-10 text-muted-foreground/40" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-white/50">Documentation Engine Offline</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Select a documentation section and click below to start AI-powered analysis of your repository.
                                </p>
                            </div>
                            <Button
                                onClick={fetchDoc}
                                variant="retro-3d"
                                size="lg"
                                className="px-12 h-14 text-base gap-3"
                            >
                                <Sparkles className="w-5 h-5" />
                                Generate Document
                            </Button>
                        </div>
                    ) : (
                        <div id="printable-doc" className="animate-in fade-in slide-in-from-bottom-4 duration-700 print:text-black">
                            <div className="mb-8 pb-8 border-b border-white/5 print:border-black/10">
                                <h1 className="text-4xl font-bold tracking-tight mb-2 capitalize">{activeSection.replace('-', ' ')} Guide</h1>
                                <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Repository: {repoName}</p>
                            </div>
                            <MarkdownRenderer content={doc} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentationHubView;
