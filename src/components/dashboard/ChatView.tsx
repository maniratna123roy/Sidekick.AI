import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import MarkdownRenderer from '@/components/dashboard/MarkdownRenderer';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: any[];
}

const ChatView = ({ initialRepo: repoName, repoId }: { initialRepo: string | null, repoId?: string }) => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isChatting, setIsChatting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!repoName) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await (supabase as any)
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .eq('repo_name', repoName)
                .order('created_at', { ascending: true });

            if (data && !error) {
                setMessages(data.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content
                })));
            }
        };

        fetchHistory();
    }, [repoName]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsChatting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // Save user msg to DB
            await (supabase as any).from('chat_messages').insert([{
                user_id: user.id,
                repo_name: repoName,
                role: 'user',
                content: userMsg.content
            }]);

            const result = await api.chat(userMsg.content, repoName || undefined, repoId);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.answer,
                sources: result.sources
            };

            // Save AI msg to DB
            await (supabase as any).from('chat_messages').insert([{
                user_id: user.id,
                repo_name: repoName,
                role: 'assistant',
                content: aiMsg.content
            }]);

            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Error: " + error.message
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsChatting(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="font-bold font-display tracking-tight">AI Assistant</h2>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                        <Bot className="w-16 h-16" />
                        <p className="font-display text-xl uppercase tracking-widest">Awaiting Transmission</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                            <div className={cn(
                                "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0",
                                msg.role === 'user' ? "bg-primary/20" : "bg-violet-500/20"
                            )}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            <div className={cn(
                                "max-w-[80%] space-y-4",
                                msg.role === 'user' ? "items-end text-right" : "items-start text-left"
                            )}>
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                    msg.role === 'user'
                                        ? "bg-primary text-primary-foreground font-medium"
                                        : "bg-white/5 border border-white/5 backdrop-blur-md"
                                )}>
                                    <MarkdownRenderer content={msg.content} />
                                </div>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-start">
                                        {msg.sources.map((src: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 text-[9px] font-mono p-1.5 rounded-lg bg-black/40 border border-white/5 hover:border-primary/50 transition-colors cursor-help"
                                                title={`Lines ${src.startLine}-${src.endLine}`}
                                            >
                                                <Github className="w-2.5 h-2.5" />
                                                <span className="truncate max-w-[120px]">{src.filename.split('/').pop()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isChatting && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-white/10 flex items-center justify-center animate-pulse">
                            <Bot className="w-4 h-4 animate-bounce" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 flex gap-1 items-center h-fit">
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-6 pt-0 mt-auto">
                <form onSubmit={handleChat} className="bg-black/30 border border-white/10 rounded-2xl p-2 flex gap-2 focus-within:border-primary/50 transition-all shadow-2xl">
                    <Input
                        placeholder="Query codebase architecture..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/30 font-medium"
                        disabled={isChatting}
                    />
                    <Button type="submit" size="icon" className="rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all" disabled={isChatting || !query.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatView;
