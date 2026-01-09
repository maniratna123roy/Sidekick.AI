import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import FunnelText from '@/components/FunnelText';
import ScrollReveal from '@/components/ScrollReveal';
import MockTerminal from '@/components/MockTerminal';
import { useLanguage } from '@/contexts/LanguageContext';

const Demo = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <span className="font-mono text-xs text-primary uppercase tracking-wider mb-4 block">
              Interactive Demo
            </span>
          </ScrollReveal>
          <FunnelText
            text={t('demo.title')}
            as="h1"
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            delay={100}
          />
          <ScrollReveal delay={300}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('demo.subtitle')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Terminal */}
      <section className="py-8 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto">
          <ScrollReveal delay={200}>
            <MockTerminal />
          </ScrollReveal>

          {/* Tips */}
          <ScrollReveal delay={400}>
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <div className="glass-panel p-4 text-center">
                <span className="font-mono text-xs text-primary">Tip #1</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask about specific functions or classes by name
                </p>
              </div>
              <div className="glass-panel p-4 text-center">
                <span className="font-mono text-xs text-primary">Tip #2</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Request architecture diagrams for visual understanding
                </p>
              </div>
              <div className="glass-panel p-4 text-center">
                <span className="font-mono text-xs text-primary">Tip #3</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Click file links to jump directly to source code
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Example Queries */}
      <section className="py-24 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FunnelText
              text="Example Queries"
              as="h2"
              className="text-2xl md:text-3xl font-bold text-foreground mb-4"
            />
            <p className="text-muted-foreground">
              Here are some powerful questions you can ask about any repository
            </p>
          </div>

          <ScrollReveal delay={200}>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'What design patterns are used in this codebase?',
                'How is error handling implemented across the API?',
                'Explain the data flow from user input to database',
                'What are the main security considerations?',
                'How do the frontend and backend communicate?',
                'What testing strategies are employed?',
                'Walk me through the deployment pipeline',
                'What external APIs does this project integrate with?',
              ].map((query, i) => (
                <div key={i} className="glass-panel-hover p-4 cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-primary mt-1">→</span>
                    <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                      "{query}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-8">
        <div className="container max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <FunnelText
              text="Ready for the full experience?"
              as="h2"
              className="text-2xl md:text-4xl font-bold text-foreground mb-6"
            />
            <p className="text-muted-foreground mb-8">
              Sign in to connect your own repositories and unlock the complete power of Sidekick.ai
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 border-glow gap-2 px-10 h-12">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Demo;
