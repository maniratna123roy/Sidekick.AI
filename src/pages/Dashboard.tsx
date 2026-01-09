import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, MessageSquare, Plus, Send, Loader2, GitBranch } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: any[];
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Indexing State
    const [repoUrl, setRepoUrl] = useState('');
    const [isIndexing, setIsIndexing] = useState(false);
    const [indexedRepos, setIndexedRepos] = useState<string[]>([]);

    // Chat State
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isChatting, setIsChatting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/auth');
                return;
            }
            setUser(session.user);
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                navigate('/auth');
            } else {
                setUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/');
        } catch (error: any) {
            toast({
                title: "Error signing out",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleIndexRepo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;

        setIsIndexing(true);
        try {
            const result = await api.indexRepo(repoUrl);
            toast({
                title: "Indexing Complete",
                description: `Successfully indexed ${result.repo}. Found ${result.stats.files} files.`,
            });
            setIndexedRepos(prev => [...prev, result.repo]);
            setRepoUrl('');
        } catch (error: any) {
            toast({
                title: "Indexing Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsIndexing(false);
        }
    };

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsChatting(true);

        try {
            // Use the last indexed repo as context, or undefined for general
            const contextRepo = indexedRepos.length > 0 ? indexedRepos[indexedRepos.length - 1] : undefined;
            const result = await api.chat(userMsg.content, contextRepo);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.answer,
                sources: result.sources
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            toast({
                title: "Chat Error",
                description: error.message,
                variant: "destructive",
            });
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error processing your request. Please check the backend logs."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsChatting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-primary font-mono">Loading user data...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="glass-panel p-8 rounded-2xl border border-border/50 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold font-display">
                                    Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                                </h1>
                                <p className="text-muted-foreground font-mono text-sm">{user?.email}</p>
                            </div>
                        </div>

                        <Button variant="outline" onClick={handleSignOut} className="gap-2 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Repository Management */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-panel p-6 rounded-xl border border-border/50">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <GitBranch className="w-5 h-5 text-violet-500" />
                                Index Repository
                            </h2>
                            <form onSubmit={handleIndexRepo} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="https://github.com/username/repo"
                                        value={repoUrl}
                                        onChange={(e) => setRepoUrl(e.target.value)}
                                        className="bg-background/50"
                                        disabled={isIndexing}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter a public GitHub URL to analyze.
                                    </p>
                                </div>
                                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isIndexing || !repoUrl}>
                                    {isIndexing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Indexing...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Index Repository
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>

                        <div className="glass-panel p-6 rounded-xl border border-border/50">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                Indexed Repositories
                            </h3>
                            {indexedRepos.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No repositories indexed yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {indexedRepos.map((repo, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm p-2 rounded bg-primary/5 border border-primary/10">
                                            <GitBranch className="w-3 h-3 text-primary" />
                                            <span className="truncate">{repo}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Chat Interface */}
                    <div className="lg:col-span-2">
                        <div className="glass-panel rounded-xl border border-border/50 h-[600px] flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    Sidekick Chat
                                </h2>
                                {indexedRepos.length > 0 && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        Context: {indexedRepos[indexedRepos.length - 1]}
                                    </span>
                                )}
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/30" ref={scrollRef}>
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                        <MessageSquare className="w-12 h-12 mb-4" />
                                        <p>Ask a question about your code</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted/80 backdrop-blur-sm border border-border/50'
                                                }`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                                {/* Sources Citation */}
                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-border/20">
                                                        <p className="text-xs font-semibold mb-1 opacity-70">Sources:</p>
                                                        <div className="space-y-1">
                                                            {msg.sources.map((src, idx) => (
                                                                <div key={idx} className="text-xs font-mono bg-background/50 p-1 rounded border border-border/10 flex justify-between">
                                                                    <span className="truncate max-w-[200px]">{src.filename}</span>
                                                                    <span className="opacity-70">L{src.startLine}-{src.endLine}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isChatting && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted/80 rounded-2xl px-4 py-3 border border-border/50">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-background/50 border-t border-border/50">
                                <form onSubmit={handleChat} className="flex gap-2">
                                    <Input
                                        placeholder="How does the authentication middleware work?"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="flex-1 bg-background/50 focus:bg-background transition-colors"
                                        disabled={isChatting}
                                    />
                                    <Button type="submit" size="icon" disabled={isChatting || !query.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
