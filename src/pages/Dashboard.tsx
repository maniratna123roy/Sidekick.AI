import { useEffect, useState, useRef } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from '@/components/dashboard/Sidebar';
import { useToast } from '@/hooks/use-toast';
import {
    GitBranch,
    Plus,
    Loader2,
    MessageSquare,
    Share2,
    AlertCircle,
    TrendingUp,
    FileCode,
    Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Component imports for sub-views (placeholders for now)
import ChatView from '@/components/dashboard/ChatView';
import KnowledgeGraph from '@/components/dashboard/KnowledgeGraph';
import ErrorExplainerView from '@/components/dashboard/ErrorExplainerView';
import DocumentationHubView from '@/components/dashboard/DocumentationHubView';
import FileExplorerView from '@/components/dashboard/FileExplorerView';

const Dashboard = ({ activeTab = 'overview' }: { activeTab?: string }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Indexing State
    const [repoUrl, setRepoUrl] = useState('');
    const [isIndexing, setIsIndexing] = useState(false);
    const [indexedRepos, setIndexedRepos] = useState<{ name: string, is_active: boolean }[]>([]);
    const [globalSelectedRepo, setGlobalSelectedRepo] = useState<string | null>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/auth');
                return;
            }
            setUser(session.user);

            // Fetch indexed repos for this user
            const { data: repos, error } = await (supabase as any)
                .from('indexed_repositories')
                .select('repo_name, is_active')
                .eq('user_id', session.user.id);

            if (repos && !error) {
                const mappedRepos = repos.map((r: any) => ({ name: r.repo_name, is_active: r.is_active }));
                setIndexedRepos(mappedRepos);

                // Set initial global selection to last active repo
                const activeOnes = mappedRepos.filter((r: any) => r.is_active);
                if (activeOnes.length > 0) {
                    setGlobalSelectedRepo(activeOnes[activeOnes.length - 1].name);
                }
            }

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

            // Save to Supabase
            const { error: dbError } = await (supabase as any)
                .from('indexed_repositories')
                .insert([{
                    user_id: user.id,
                    repo_url: repoUrl,
                    repo_name: result.repo
                }]);

            if (dbError) throw dbError;

            toast({
                title: "Indexing Complete",
                description: `Successfully indexed ${result.repo}.`,
            });
            setIndexedRepos(prev => [...prev, { name: result.repo, is_active: true }]);
            setGlobalSelectedRepo(result.repo);
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

    const toggleRepoStatus = async (repoName: string, currentStatus: boolean) => {
        try {
            const { error } = await (supabase as any)
                .from('indexed_repositories')
                .update({ is_active: !currentStatus })
                .eq('user_id', user.id)
                .eq('repo_name', repoName);

            if (error) throw error;

            setIndexedRepos(prev => prev.map(r =>
                r.name === repoName ? { ...r, is_active: !currentStatus } : r
            ));

            toast({
                title: !currentStatus ? "Repository Activated" : "Repository Deactivated",
                description: `${repoName} is now ${!currentStatus ? 'active' : 'inactive'}.`,
            });
        } catch (error: any) {
            toast({
                title: "Toggle Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const activeRepos = indexedRepos.filter(r => r.is_active).map(r => r.name);
    const primaryRepo = activeRepos[activeRepos.length - 1];

    // Determine what to show in main content area
    const currentPath = location.pathname;
    const isOverview = currentPath === '/dashboard';

    // Auto-detect tab from URL if not overview
    const urlTab = currentPath.split('/').pop();
    const effectiveTab = isOverview ? 'overview' : urlTab;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div className="text-primary font-mono text-sm uppercase tracking-widest animate-pulse">Initializing Sidekick...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground">
            <Sidebar onSignOut={handleSignOut} user={user} />

            <main className="flex-1 overflow-hidden relative bg-[#050505] flex flex-col">
                {/* Header with Universal Selector */}
                <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <GitBranch className="w-4 h-4 text-primary" />
                            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Active Context:</span>
                            <select
                                value={globalSelectedRepo || ''}
                                onChange={(e) => setGlobalSelectedRepo(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer outline-none"
                            >
                                <option value="" disabled className="bg-[#0f0f0f]">Select Repository</option>
                                {indexedRepos.filter(r => r.is_active).map(repo => (
                                    <option key={repo.name} value={repo.name} className="bg-[#0f0f0f]">
                                        {repo.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Systems Nominal</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] -z-10" />

                    <div className="p-8 max-w-7xl mx-auto space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPath}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isOverview ? (
                                    <div className="space-y-8">
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Repos Indexed', value: indexedRepos.length, icon: GitBranch, color: 'text-primary' },
                                                { label: 'Queries Run', value: '42', icon: MessageSquare, color: 'text-blue-500' },
                                                { label: 'Map Density', value: 'High', icon: Share2, color: 'text-purple-500' },
                                                { label: 'Health Score', value: '98%', icon: TrendingUp, color: 'text-green-500' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="glass-panel p-6 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                                    </div>
                                                    <p className="text-2xl font-bold font-display">{stat.value}</p>
                                                    <p className="text-xs text-muted-foreground uppercase font-mono tracking-tighter">{stat.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid lg:grid-cols-3 gap-8">
                                            {/* Quick Index */}
                                            <div className="lg:col-span-1 space-y-6">
                                                <div className="glass-panel p-6 rounded-2xl border-white/5 bg-white/5">
                                                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                                        <Plus className="w-5 h-5 text-primary" />
                                                        Quick Analysis
                                                    </h2>
                                                    <form onSubmit={handleIndexRepo} className="space-y-4">
                                                        <Input
                                                            placeholder="GitHub Repository URL"
                                                            value={repoUrl}
                                                            onChange={(e) => setRepoUrl(e.target.value)}
                                                            className="bg-black/20 border-white/10"
                                                            disabled={isIndexing}
                                                        />
                                                        <Button type="submit" className="w-full bg-primary text-primary-foreground group" disabled={isIndexing || !repoUrl}>
                                                            {isIndexing ? (
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <GitBranch className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                                                            )}
                                                            {isIndexing ? 'Cloning Repo...' : 'Index Repository'}
                                                        </Button>
                                                    </form>
                                                </div>

                                                <div className="glass-panel p-6 rounded-2xl border-white/5 bg-white/5">
                                                    <h2 className="text-sm font-bold text-muted-foreground uppercase mb-4 tracking-widest">Active Inventory</h2>
                                                    {indexedRepos.length === 0 ? (
                                                        <div className="text-center py-8 opacity-30 italic text-sm">No repos analyzed yet.</div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {indexedRepos.map(repo => (
                                                                <div key={repo.name} className={cn(
                                                                    "flex items-center justify-between p-3 rounded-xl border transition-all",
                                                                    repo.is_active ? "bg-white/5 border-white/5" : "bg-black/40 border-white/5 opacity-50 grayscale"
                                                                )}>
                                                                    <div className="flex items-center gap-3 truncate">
                                                                        <FileCode className={cn("w-4 h-4 shrink-0", repo.is_active ? "text-violet-400" : "text-muted-foreground")} />
                                                                        <span className="text-sm truncate">{repo.name}</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => toggleRepoStatus(repo.name, repo.is_active)}
                                                                        className={cn(
                                                                            "w-8 h-4 rounded-full relative transition-colors duration-200",
                                                                            repo.is_active ? "bg-primary" : "bg-white/10"
                                                                        )}
                                                                    >
                                                                        <div className={cn(
                                                                            "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-200",
                                                                            repo.is_active ? "left-4.5" : "left-0.5"
                                                                        )} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Activity/Intro */}
                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="glass-panel p-8 rounded-2xl border-white/5 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                                                    <h2 className="text-2xl font-bold font-display mb-2">Welcome to your AI Sidekick</h2>
                                                    <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
                                                        Deep-dive into any codebase. Analyze dependencies, visualize logic, and debug errors with RAG-powered intelligence.
                                                    </p>
                                                    <div className="flex gap-3">
                                                        <Button onClick={() => navigate('/dashboard/chat')} variant="outline">
                                                            Start Chatting
                                                        </Button>
                                                        <Button onClick={() => navigate('/dashboard/map')} variant="outline">
                                                            Explore Map
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div
                                                        onClick={() => navigate('/dashboard/error')}
                                                        className="glass-panel p-6 rounded-2xl border-white/5 bg-white/5 hover:border-red-500/30 cursor-pointer group transition-all"
                                                    >
                                                        <AlertCircle className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                                                        <h3 className="font-bold mb-1">Error Explainer</h3>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-mono">Debug stack traces instantly</p>
                                                    </div>
                                                    <div
                                                        onClick={() => navigate('/dashboard/docs')}
                                                        className="glass-panel p-6 rounded-2xl border-white/5 bg-white/5 hover:border-orange-500/30 cursor-pointer group transition-all"
                                                    >
                                                        <Globe className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                                                        <h3 className="font-bold mb-1">Doc Hub</h3>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-mono">Browse auto-generated manuals</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-panel rounded-2xl border-white/5 bg-white/5 min-h-[calc(100vh-12rem)] relative overflow-hidden flex flex-col">
                                        {/* Subview Rendering */}
                                        {effectiveTab === 'chat' && <ChatView indexedRepos={activeRepos} initialRepo={globalSelectedRepo || activeRepos[0]} />}
                                        {effectiveTab === 'map' && <KnowledgeGraph repoName={globalSelectedRepo || primaryRepo} allRepos={activeRepos} />}
                                        {effectiveTab === 'explorer' && <FileExplorerView repoName={globalSelectedRepo || primaryRepo} allRepos={activeRepos} />}
                                        {effectiveTab === 'error' && <ErrorExplainerView indexedRepos={activeRepos} initialRepo={globalSelectedRepo || activeRepos[0]} />}
                                        {effectiveTab === 'docs' && <DocumentationHubView indexedRepos={activeRepos} initialRepo={globalSelectedRepo || activeRepos[0]} />}
                                        {effectiveTab === 'onboarding' && <div className="p-8 text-center text-muted-foreground pt-32 text-sm uppercase tracking-widest font-mono">Onboarding Path Builder coming soon...</div>}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
