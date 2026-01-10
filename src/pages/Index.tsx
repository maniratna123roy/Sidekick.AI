import { Link } from 'react-router-dom';
import { ArrowRight, Github, Zap, Search, Code, FileCode, GitBranch, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import FunnelText from '@/components/FunnelText';
import ScrollReveal from '@/components/ScrollReveal';
import FeatureCard from '@/components/FeatureCard';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Search,
      title: 'Semantic Code Search',
      description: 'Find code by meaning, not just keywords. Our vector search understands what you\'re looking for.',
      glowColor: 'cyan' as const,
    },
    {
      icon: FileCode,
      title: 'Intelligent Chunking',
      description: 'Automatically segments code by functions, classes, and logical blocks for precise retrieval.',
      glowColor: 'violet' as const,
    },
    {
      icon: GitBranch,
      title: 'Deep GitHub Links',
      description: 'Every answer includes direct links to exact file locations and line numbers.',
      glowColor: 'cyan' as const,
    },
    {
      icon: Globe,
      title: 'Multilingual Output',
      description: 'Get answers in English, Hindi, Spanish, and more. Code understanding without barriers.',
      glowColor: 'violet' as const,
    },
    {
      icon: Zap,
      title: 'RAG-Powered Answers',
      description: 'Retrieval-Augmented Generation ensures accurate, grounded responses with full context.',
      glowColor: 'cyan' as const,
    },
    {
      icon: Code,
      title: 'Mermaid Diagrams',
      description: 'Visualize architecture and flows with auto-generated diagrams from your codebase.',
      glowColor: 'violet' as const,
    },
  ];

  const stats = [
    { value: '10M+', label: 'Repos Analyzed' },
    { value: '<2s', label: 'Avg Response' },
    { value: '99.9%', label: 'Uptime' },
    { value: '50+', label: 'Languages' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center px-4 md:px-8">
        <div className="container max-w-6xl mx-auto text-center">
          {/* Tagline */}
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-primary/20 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs text-primary uppercase tracking-wider">
                {t('hero.tagline')}
              </span>
            </div>
          </ScrollReveal>

          {/* Main headline with funnel animation */}
          <FunnelText
            text={t('hero.title')}
            as="h1"
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
            delay={200}
          />

          {/* Subtitle */}
          <ScrollReveal delay={600}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={800}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/demo">
                <Button size="lg" variant="retro-3d" className="gap-2 px-8 h-12">
                  {t('hero.cta')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="border-border/50 hover:bg-muted/50 gap-2 px-8 h-12">
                  <Github className="w-4 h-4" />
                  {t('hero.secondary')}
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={1000}>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-display font-bold text-2xl md:text-3xl text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <ScrollReveal>
              <span className="font-mono text-xs text-primary uppercase tracking-wider mb-4 block">
                Capabilities
              </span>
            </ScrollReveal>
            <FunnelText
              text={t('features.title')}
              as="h2"
              className="text-3xl md:text-5xl font-bold text-foreground mb-4"
              delay={100}
            />
            <ScrollReveal delay={300}>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t('features.subtitle')}
              </p>
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <FeatureCard {...feature} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <FunnelText
              text="See It In Action"
              as="h2"
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            />
            <ScrollReveal delay={200}>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Watch how Sidekick analyzes repositories and answers your questions
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={300}>
            <div className="glass-panel overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-4 font-mono text-xs text-muted-foreground">sidekick query</span>
              </div>

              {/* Terminal content */}
              <div className="p-6 font-mono text-sm">
                <div className="flex items-start gap-2 text-muted-foreground mb-4">
                  <span className="text-primary">$</span>
                  <span>sidekick ask "How does the auth middleware work?"</span>
                </div>
                <div className="space-y-2 text-foreground/80">
                  <p className="text-muted-foreground">Analyzing repository...</p>
                  <p className="text-muted-foreground">Found 3 relevant files</p>
                  <p className="mt-4">
                    <span className="text-primary">→</span> The authentication middleware in{' '}
                    <span className="text-accent">src/middleware/auth.ts</span> uses JWT tokens
                    to verify user sessions. It checks the Authorization header and validates
                    against the secret key defined in your environment.
                  </p>
                  <p className="mt-2">
                    <span className="text-primary">📁</span>{' '}
                    <span className="text-primary underline cursor-pointer">
                      src/middleware/auth.ts:24-58
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={500}>
            <div className="text-center mt-10">
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 gap-2">
                  Try Interactive Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="glass-panel p-8 md:p-12 text-center relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <FunnelText
                  text="Ready to explore your codebase?"
                  as="h2"
                  className="text-2xl md:text-4xl font-bold text-foreground mb-4"
                />
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Join thousands of developers using Sidekick to understand complex repositories in seconds.
                </p>
                <Link to="/demo">
                  <Button size="lg" variant="retro-3d" className="gap-2 px-10 h-12">
                    Try It Now
                    <ArrowRight className="w-4 h-4" />
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

export default Index;
