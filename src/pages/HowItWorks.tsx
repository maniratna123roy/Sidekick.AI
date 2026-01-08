import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch, Database, Brain, MessageSquare, Link2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import FunnelText from '@/components/FunnelText';
import ScrollReveal from '@/components/ScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      number: '01',
      icon: GitBranch,
      title: 'Connect Repository',
      description: 'Paste any public GitHub URL or connect your private repos with OAuth. We support all major languages and frameworks.',
      details: ['Supports 50+ programming languages', 'Private repo OAuth integration', 'Automatic branch detection'],
    },
    {
      number: '02',
      icon: Database,
      title: 'Intelligent Indexing',
      description: 'Our system clones and parses your codebase, breaking it into semantic chunks by functions, classes, and modules.',
      details: ['AST-based code parsing', 'Function & class extraction', 'Documentation linking'],
    },
    {
      number: '03',
      icon: Sparkles,
      title: 'Vector Embedding',
      description: 'Each code chunk is converted into high-dimensional vectors using state-of-the-art embedding models.',
      details: ['Code-optimized embeddings', 'Semantic similarity indexing', 'Sub-second search capability'],
    },
    {
      number: '04',
      icon: MessageSquare,
      title: 'Natural Query',
      description: 'Ask questions in plain English. Our system understands intent and retrieves the most relevant code sections.',
      details: ['Intent understanding', 'Context-aware retrieval', 'Multilingual support'],
    },
    {
      number: '05',
      icon: Brain,
      title: 'RAG Synthesis',
      description: 'Retrieved code is combined with your question using Retrieval-Augmented Generation for accurate answers.',
      details: ['Grounded responses', 'Hallucination prevention', 'Source attribution'],
    },
    {
      number: '06',
      icon: Link2,
      title: 'Deep Links',
      description: 'Every answer includes clickable links to exact file locations and line numbers in your repository.',
      details: ['Line-number precision', 'GitHub integration', 'Code preview snippets'],
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <span className="font-mono text-xs text-primary uppercase tracking-wider mb-4 block">
              The Process
            </span>
          </ScrollReveal>
          <FunnelText
            text={t('how.title')}
            as="h1"
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            delay={100}
          />
          <ScrollReveal delay={300}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('how.subtitle')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4 md:px-8">
        <div className="container max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/50 to-transparent hidden md:block" />

            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={`relative flex flex-col md:flex-row items-start gap-8 mb-16 ${
                  i % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}>
                  {/* Number indicator */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full glass-panel border-primary/30 items-center justify-center z-10">
                    <span className="font-mono text-lg text-primary font-bold">{step.number}</span>
                  </div>

                  {/* Content card */}
                  <div className={`flex-1 ${i % 2 === 1 ? 'md:pr-24' : 'md:pl-24'}`}>
                    <div className="glass-panel-hover p-6 md:p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="md:hidden w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="font-mono text-sm text-primary font-bold">{step.number}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <step.icon className="w-5 h-5 text-primary" />
                            <h3 className="font-display font-semibold text-xl text-foreground">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-2 ml-0 md:ml-8">
                        {step.details.map((detail, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="py-16 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="glass-panel p-8 text-center">
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">
                System Architecture
              </h3>
              <div className="bg-muted/50 rounded-xl p-8 border border-dashed border-border">
                <pre className="text-xs md:text-sm font-mono text-muted-foreground text-left overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   Query  │  │ Response │  │ Diagrams │  │  Links   │        │
│  └────┬─────┘  └────▲─────┘  └────▲─────┘  └────▲─────┘        │
└───────┼─────────────┼─────────────┼─────────────┼───────────────┘
        │             │             │             │
        ▼             │             │             │
┌─────────────────────┴─────────────┴─────────────┴───────────────┐
│                     RAG Synthesis Engine                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Query Understanding  →  Context Retrieval  →  Synthesis  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
        │                                               ▲
        ▼                                               │
┌─────────────────────────────────────────────────────────────────┐
│                      Vector Database                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │ Code Chunks│  │ Embeddings │  │  Metadata  │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└─────────────────────────────────────────────────────────────────┘
        ▲                                               
        │                                               
┌─────────────────────────────────────────────────────────────────┐
│                     Ingestion Pipeline                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐               │
│  │  Clone │→ │  Parse │→ │  Chunk │→ │  Embed │               │
│  └────────┘  └────────┘  └────────┘  └────────┘               │
└─────────────────────────────────────────────────────────────────┘
        ▲
        │
   ┌────────────┐
   │   GitHub   │
   │   Repos    │
   └────────────┘`}
                </pre>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-8">
        <div className="container max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <FunnelText
              text="Ready to try it yourself?"
              as="h2"
              className="text-2xl md:text-4xl font-bold text-foreground mb-6"
            />
            <p className="text-muted-foreground mb-8">
              Experience the power of AI-driven code exploration firsthand
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/demo">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 border-glow gap-2 px-8">
                  Try Interactive Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="border-border/50 hover:bg-muted/50 px-8">
                  Request Access
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;
