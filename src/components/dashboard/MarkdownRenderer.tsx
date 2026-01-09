import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif'
});

const MarkdownRenderer = ({ content }: { content: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            mermaid.contentLoaded();
        }
    }, [content]);

    return (
        <div ref={containerRef} className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const lang = match ? match[1] : '';

                        if (lang === 'mermaid') {
                            return (
                                <div className="mermaid bg-black/20 rounded-xl p-4 my-4 overflow-x-auto border border-white/5">
                                    {String(children).replace(/\n$/, '')}
                                </div>
                            );
                        }

                        return (
                            <code className={cn(className, "bg-black/40 rounded px-1.5 py-0.5 font-mono text-xs")} {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre({ children }) {
                        return <pre className="bg-black/30 p-4 rounded-xl my-4 overflow-x-auto border border-white/5">{children}</pre>;
                    },
                    a({ href, children }) {
                        return (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium decoration-primary/30"
                            >
                                {children}
                            </a>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
