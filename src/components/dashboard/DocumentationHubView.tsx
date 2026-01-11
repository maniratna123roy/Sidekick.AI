import { useState, useEffect } from 'react';
import { FileText, Book, Code, Shield, HelpCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const DocumentationHubView = ({ indexedRepos, initialRepo }: { indexedRepos: string[], initialRepo: string | null }) => {
    const [doc, setDoc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('architecture');
    const [localRepo, setLocalRepo] = useState<string | null>(initialRepo);

    const sections = [
        { id: 'architecture', label: 'Architecture Overview', icon: Book },
        { id: 'api', label: 'API Endpoints', icon: Code },
        { id: 'lifecycle', label: 'Request Lifecycle', icon: FileText },
        { id: 'security', label: 'Security & Auth', icon: Shield },
    ];

    useEffect(() => {
        const fetchDoc = async () => {
            const repo = localRepo || (indexedRepos.length > 0 ? indexedRepos[indexedRepos.length - 1] : null);
            if (!repo) return;
            setLoading(true);
            try {
                const response = await api.chat(
                    `SYSTEM: DOCUMENTATION MODE. GENERATE A COMPREHENSIVE ${activeSection.toUpperCase()} GUIDE FOR THIS REPOSITORY. USE MARKDOWN.`,
                    repo
                );
                setDoc(response.answer);
            } catch (err: any) {
                console.error("[DocsHub] Generation failed:", err);
                setDoc(`Failed to generate documentation: ${err.message || "Unknown error"}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [activeSection, localRepo, indexedRepos]);

    return (
        <div className="h-full flex flex-col md:flex-row">
            {/* Mini Sidebar for Docs */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 p-4 space-y-4">
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">Knowledge Base</h3>
                    {indexedRepos.length > 0 && (
                        <select
                            value={localRepo || ''}
                            onChange={(e) => setLocalRepo(e.target.value)}
                            className="w-full text-xs font-bold bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-primary/50 transition-colors"
                        >
                            {indexedRepos.map(repo => (
                                <option key={repo} value={repo} className="bg-[#0f0f0f]">{repo}</option>
                            ))}
                        </select>
                    )}
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
            <div className="flex-1 overflow-y-auto p-8 relative">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-xs font-mono uppercase tracking-widest animate-pulse">Analyzing Codebase for Documentation...</p>
                    </div>
                ) : doc?.startsWith('Failed to generate documentation') ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white">Generation Failed</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {doc}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                        >
                            Retry Generation
                        </button>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="whitespace-pre-wrap leading-relaxed text-slate-300 font-sans">
                            {doc}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentationHubView;
