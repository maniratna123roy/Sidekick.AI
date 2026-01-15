import { Link } from 'react-router-dom';
import {
  ArrowRight, Search, FileCode, GitBranch, Globe, Zap, Code,
  Shield, Clock, Layers, Terminal, BookOpen, Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import FunnelText from '@/components/FunnelText';
import ScrollReveal from '@/components/ScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';

const Features = () => {
  const { t } = useLanguage();

  const mainFeatures = [
    {
      icon: Search,
      title: 'Semantic Code Search',
      description: 'Move beyond keyword matching. Our vector search understands the meaning and context of your queries, finding relevant code even when you don\'t know the exact terms.',
      benefits: [
        'Concept-based matching',
        'Cross-language understanding',
        'Fuzzy intent recognition',
      ],
    },
    {
      icon: FileCode,
      title: 'Intelligent Code Chunking',
      description: 'We don\'t just split files arbitrarily. Our parser understands code structure, creating semantic chunks at function, class, and module boundaries.',
      benefits: [
        'AST-aware parsing',
        'Dependency tracking',
        'Context preservation',
      ],
    },
    {
      icon: Zap,
      title: 'RAG-Powered Synthesis',
      description: 'Retrieval-Augmented Generation grounds every answer in your actual code. No hallucinations, no guessing—just accurate, verifiable responses.',
      benefits: [
        'Source attribution',
        'Confidence scoring',
        'Factual grounding',
      ],
    },
  ];

  const additionalFeatures = [
    { icon: Globe, title: 'Multilingual Output', desc: 'Get answers in English, Hindi, Spanish and more' },
    { icon: GitBranch, title: 'Deep GitHub Links', desc: 'Direct links to exact file locations and line numbers' },
    { icon: Code, title: 'Mermaid Diagrams', desc: 'Auto-generated architecture and flow visualizations' },
    { icon: Shield, title: 'Private Repos', desc: 'Secure OAuth integration for private repositories' },
    { icon: Clock, title: 'Real-time Updates', desc: 'Automatic re-indexing when your codebase changes' },
    { icon: Layers, title: 'Multi-Repo Search', desc: 'Query across multiple repositories simultaneously' },
    { icon: Terminal, title: 'CLI Integration', desc: 'Command-line tool for developer workflows' },
    { icon: BookOpen, title: 'Doc Linking', desc: 'Connects code with related documentation files' },
    { icon: Workflow, title: 'IDE Plugins', desc: 'Native extensions for VS Code and JetBrains' },
  ];

  const languages = [
    'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java',
    'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <span className="font-mono text-xs text-primary uppercase tracking-wider mb-4 block">
              Capabilities
            </span>
          </ScrollReveal>
          <FunnelText
            text={t('features.title')}
            as="h1"
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            delay={100}
          />
          <ScrollReveal delay={300}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 px-4 md:px-8">
        <div className="container max-w-6xl mx-auto">
          <div className="space-y-24">
            {mainFeatures.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={`flex flex-col lg:flex-row items-center gap-12 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}>
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                        {feature.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, j) => (
                        <li key={j} className="flex items-center gap-3 text-foreground">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          </span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual */}
                  <div className="flex-1 w-full">
                    <div className="glass-panel p-6 md:p-8">
                      <div className="aspect-video bg-muted/50 rounded-lg border border-dashed border-border flex items-center justify-center">
                        <feature.icon className="w-16 h-16 text-primary/30" />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-24 px-4 md:px-8 bg-muted/10">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <FunnelText
              text="More Capabilities"
              as="h2"
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className="glass-panel-hover p-6 h-full">
                  <feature.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-24 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <span className="font-mono text-xs text-primary uppercase tracking-wider mb-4 block">
              Universal Support
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              50+ Languages Supported
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-wrap justify-center gap-3">
              {languages.map((lang, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full glass-panel text-sm font-mono text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  {lang}
                </span>
              ))}
              <span className="px-4 py-2 rounded-full glass-panel text-sm font-mono text-primary">
                + 40 more
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-8">
        <div className="container max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="glass-panel p-8 md:p-12">
              <FunnelText
                text="Experience All Features"
                as="h2"
                className="text-2xl md:text-4xl font-bold text-foreground mb-4"
              />
              <p className="text-muted-foreground mb-8">
                Request early access or sign in to start exploring today
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 border-glow gap-2 px-8">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="border-border/50 hover:bg-muted/50 px-8">
                    Get Access
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Features;
