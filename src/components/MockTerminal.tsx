import { useState, useEffect, useRef } from 'react';
import { Play, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MockTerminalProps {
  className?: string;
}

const MockTerminal = ({ className = '' }: MockTerminalProps) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  const sampleQueries = [
    "How does the authentication flow work in this repo?",
    "What are the main API endpoints?",
    "Explain the database schema structure",
  ];

  const mockResponse = [
    "",
    "Analyzing repository structure...",
    "",
    "Found 147 files across 23 directories",
    "Identified 12 modules related to authentication",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "📁 src/auth/AuthProvider.tsx (L:24-89)",
    "   The main authentication context provider that wraps",
    "   the application and manages user session state.",
    "",
    "📁 src/hooks/useAuth.ts (L:1-45)",
    "   Custom hook that provides access to auth context",
    "   with methods: login(), logout(), refreshToken()",
    "",
    "📁 src/api/auth.ts (L:12-78)",
    "   API client for authentication endpoints:",
    "   - POST /api/auth/login",
    "   - POST /api/auth/register", 
    "   - POST /api/auth/refresh",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "The authentication uses JWT tokens with refresh",
    "capability. Session is persisted in localStorage",
    "and validated on each protected route access.",
  ];

  const handleSubmit = () => {
    if (!query.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setResponse([]);
    setShowDiagram(false);

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockResponse.length) {
        setResponse(prev => [...prev, mockResponse[index]]);
        index++;
        
        if (responseRef.current) {
          responseRef.current.scrollTop = responseRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 80);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`glass-panel overflow-hidden ${className}`}>
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">sidekick.ai terminal</span>
        <div className="w-16" />
      </div>

      {/* Query input */}
      <div className="p-4 border-b border-border/50">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-2 font-mono">
              Ask about your repository
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., How does the authentication flow work?"
              className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
              rows={2}
              disabled={isProcessing}
            />
          </div>
          <div className="flex flex-col justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!query.trim() || isProcessing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run
            </Button>
          </div>
        </div>

        {/* Sample queries */}
        <div className="flex flex-wrap gap-2 mt-3">
          {sampleQueries.map((sample, i) => (
            <button
              key={i}
              onClick={() => setQuery(sample)}
              className="text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors font-mono"
              disabled={isProcessing}
            >
              {sample.slice(0, 35)}...
            </button>
          ))}
        </div>
      </div>

      {/* Response area */}
      <div 
        ref={responseRef}
        className="h-80 overflow-y-auto p-4 font-mono text-sm scroll-smooth"
      >
        {response.length === 0 && !isProcessing ? (
          <div className="h-full flex items-center justify-center text-muted-foreground/50">
            <p>Response will appear here...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {response.map((line, i) => (
              <div 
                key={i} 
                className={`${
                  line.startsWith('📁') 
                    ? 'text-primary' 
                    : line.startsWith('━') 
                    ? 'text-border' 
                    : line.startsWith('   -')
                    ? 'text-accent'
                    : 'text-foreground/80'
                }`}
              >
                {line || '\u00A0'}
              </div>
            ))}
            {isProcessing && (
              <span className="inline-block w-2 h-4 bg-primary terminal-cursor" />
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {response.length > 0 && !isProcessing && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-border/50 bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiagram(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            Generate Diagram (Mermaid)
          </Button>
        </div>
      )}

      {/* Mermaid Diagram Placeholder */}
      {showDiagram && (
        <div className="p-4 border-t border-border/50">
          <div className="glass-panel p-6 text-center">
            <div className="font-mono text-xs text-muted-foreground mb-4">Mermaid Diagram</div>
            <div className="bg-muted/50 rounded-lg p-8 border border-dashed border-border">
              <pre className="text-xs text-muted-foreground font-mono text-left">
{`graph TD
    A[User] --> B[AuthProvider]
    B --> C{Token Valid?}
    C -->|Yes| D[Allow Access]
    C -->|No| E[Redirect Login]
    E --> F[Login API]
    F --> G[Store JWT]
    G --> B`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTerminal;
