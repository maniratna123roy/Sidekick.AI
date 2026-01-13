import { useState } from 'react';
import { AlertCircle, Terminal, FileSearch, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

const ErrorExplainerView = ({ initialRepo: repoName, repoId }: { initialRepo: string | null, repoId?: string }) => {
    const [trace, setTrace] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!trace.trim()) return;
        setIsAnalyzing(true);
        try {
            const response = await api.chat(
                `SYSTEM: ANALYZE ERROR MODE. EXPLAIN THE FOLLOWING STACK TRACE/LOG AND LINK TO FILES IN THE REPO: \n\n ${trace}`,
                repoName || undefined,
                repoId
            );
            setResult(response.answer);
        } catch (err: any) {
            setResult("Analysis failed: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 space-y-8 max-w-4xl mx-auto">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    Explain My Error
                </h2>
                <p className="text-muted-foreground text-sm">
                    Paste your stack trace, console logs, or failing test output. Sidekick will map it to your codebase.
                </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black/40 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                    <Terminal className="w-3 h-3" /> INPUT_LOGS_HERE
                </div>
                <Textarea
                    placeholder="Paste error logs here..."
                    value={trace}
                    onChange={(e) => setTrace(e.target.value)}
                    className="min-h-[200px] bg-black/20 border-white/10 font-mono text-xs leading-relaxed"
                />
                <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !trace.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSearch className="w-4 h-4 mr-2" />}
                    Analyze Impacted Files
                </Button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border-red-500/20 bg-red-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-red-400">
                        <Lightbulb className="w-5 h-5" /> Analysis Results
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                            {result}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ErrorExplainerView;
