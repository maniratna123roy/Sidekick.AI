import { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { api } from '@/lib/api';
import { Loader2, TrendingUp, FileCode, Zap, GitCommit, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];

const RepoAnalyticsView = ({ repoName }: { repoName: string }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!repoName) return;
            setLoading(true);
            try {
                const result = await api.getAnalytics(repoName);
                setData(result);
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [repoName]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-mono animate-pulse uppercase tracking-widest text-xs">Processing Repository Bio-metrics...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md p-8 glass-panel border-red-500/20 bg-red-500/5 rounded-2xl">
                    <p className="text-red-400 font-mono text-sm tracking-wider italic">Analysis Failure: {error || 'No context found'}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Ensure the repository is indexed and your sidekick is properly connected.</p>
                </div>
            </div>
        );
    }

    const langData = Object.entries(data.languages).map(([name, value]) => ({ name, value }));
    const complexityData = data.complexity.topComplexFiles;
    const commitData = data.gitMetrics.commitData;

    return (
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-black/20">
            <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">Repository Analytics</h1>
                <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest">Deep context for {repoName}</p>
            </div>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Files', value: data.totalFiles, icon: FileCode, color: 'text-primary' },
                    { label: 'Total LoC', value: data.totalLoC.toLocaleString(), icon: TrendingUp, color: 'text-blue-400' },
                    { label: 'Avg Complexity', value: data.complexity.averageComplexity, icon: Zap, color: 'text-yellow-400' },
                    { label: 'Total Commits', value: data.gitMetrics.totalCommits, icon: GitCommit, color: 'text-green-400' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="glass-panel p-6 rounded-2xl bg-white/5 border-white/5 hover:bg-white/10 transition-all hover:scale-[1.02]"
                    >
                        <stat.icon className={cn("w-5 h-5 mb-4", stat.color)} />
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Language Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-6 rounded-2xl bg-white/5 border-white/5 flex flex-col min-h-[400px]"
                >
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Language Composition
                    </h2>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={langData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {langData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* File Complexity */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-6 rounded-2xl bg-white/5 border-white/5 flex flex-col min-h-[400px]"
                >
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        Code Complexity Hotspots
                    </h2>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={complexityData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={120}
                                    axisLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="complexity" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Activity History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-2xl bg-white/5 border-white/5"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <GitCommit className="w-5 h-5 text-green-400" />
                        Development Velocity
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>{data.gitMetrics.contributors} Contributors</span>
                        </div>
                        <div>Last Active: {new Date(data.gitMetrics.lastCommit).toLocaleDateString()}</div>
                    </div>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={commitData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default RepoAnalyticsView;
