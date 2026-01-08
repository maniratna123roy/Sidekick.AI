import { useState } from 'react';
import Layout from '@/components/Layout';
import FunnelText from '@/components/FunnelText';
import ScrollReveal from '@/components/ScrollReveal';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Animations = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(prev => prev + 1);

  return (
    <Layout>
      {/* Header */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <span className="font-mono text-xs text-primary uppercase tracking-wider mb-4 block">
              Motion System
            </span>
          </ScrollReveal>
          <FunnelText
            text="Animation Guide"
            as="h1"
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            delay={100}
          />
          <ScrollReveal delay={300}>
            <p className="text-xl text-muted-foreground">
              Motion principles and animation components
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Funnel Text */}
      <section className="py-16 px-4 md:px-8">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Funnel Text Animation</h2>
            <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Replay
            </Button>
          </div>

          <div className="glass-panel p-8" key={`funnel-${refreshKey}`}>
            <p className="font-mono text-xs text-muted-foreground mb-4">
              Text enters sequentially, contracts inward, then gently expands
            </p>
            <FunnelText
              text="Words animate in sequence"
              as="h2"
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              delay={200}
            />
            <FunnelText
              text="Each word contracts then expands smoothly"
              as="p"
              className="text-lg text-muted-foreground"
              delay={500}
              staggerDelay={80}
            />
          </div>

          <div className="mt-6 glass-panel p-6">
            <p className="font-mono text-xs text-primary mb-3">Usage</p>
            <pre className="font-mono text-sm text-muted-foreground overflow-x-auto">
{`<FunnelText
  text="Your headline text"
  as="h1"
  className="text-4xl font-bold"
  delay={200}
  staggerDelay={50}
/>`}
            </pre>
          </div>
        </div>
      </section>

      {/* Scroll Reveal */}
      <section className="py-16 px-4 md:px-8 bg-muted/10">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8">Scroll Reveal</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ScrollReveal direction="up" delay={0}>
              <div className="glass-panel p-6 h-32 flex items-center justify-center">
                <span className="text-muted-foreground">direction="up"</span>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="down" delay={100}>
              <div className="glass-panel p-6 h-32 flex items-center justify-center">
                <span className="text-muted-foreground">direction="down"</span>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={200}>
              <div className="glass-panel p-6 h-32 flex items-center justify-center">
                <span className="text-muted-foreground">direction="left"</span>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={300}>
              <div className="glass-panel p-6 h-32 flex items-center justify-center">
                <span className="text-muted-foreground">direction="right"</span>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={400}>
            <div className="glass-panel p-6">
              <p className="font-mono text-xs text-primary mb-3">Usage</p>
              <pre className="font-mono text-sm text-muted-foreground overflow-x-auto">
{`<ScrollReveal direction="up" delay={200} duration={600}>
  <YourComponent />
</ScrollReveal>`}
              </pre>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CSS Animations */}
      <section className="py-16 px-4 md:px-8">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8">CSS Animations</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            <ScrollReveal delay={0}>
              <div className="glass-panel p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 mx-auto mb-4 animate-float" />
                <p className="font-mono text-xs text-muted-foreground">animate-float</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="glass-panel p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 mx-auto mb-4 animate-pulse-glow" />
                <p className="font-mono text-xs text-muted-foreground">animate-pulse-glow</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="glass-panel p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 mx-auto mb-4 animate-glow-pulse" />
                <p className="font-mono text-xs text-muted-foreground">animate-glow-pulse</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="glass-panel p-6 text-center">
                <div className="w-16 h-16 rounded-lg bg-primary/20 border border-primary/30 mx-auto mb-4 animate-scale-in" />
                <p className="font-mono text-xs text-muted-foreground">animate-scale-in</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="glass-panel p-6 text-center">
                <div className="w-16 h-16 rounded-lg bg-primary/20 border border-primary/30 mx-auto mb-4 animate-fade-in-up" />
                <p className="font-mono text-xs text-muted-foreground">animate-fade-in-up</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <div className="glass-panel p-6 text-center">
                <div className="w-16 h-16 rounded-lg bg-primary/20 border border-primary/30 mx-auto mb-4 animate-slide-in-right" />
                <p className="font-mono text-xs text-muted-foreground">animate-slide-in-right</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Interactive Hover */}
      <section className="py-16 px-4 md:px-8 bg-muted/10">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8">Interactive Effects</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal delay={100}>
              <div className="glass-panel-hover p-6 cursor-pointer">
                <p className="font-medium text-foreground mb-2">Glass Panel Hover</p>
                <p className="text-sm text-muted-foreground">
                  Hover to see the glow effect and border highlight
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="glass-panel p-6">
                <p className="font-medium text-foreground mb-2">Animated Underline</p>
                <a href="#" className="animated-underline text-primary">
                  Hover for smooth underline
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="glass-panel p-6">
                <p className="font-medium text-foreground mb-4">Button Glow</p>
                <Button className="bg-primary text-primary-foreground border-glow">
                  Glowing Button
                </Button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="glass-panel p-6">
                <p className="font-medium text-foreground mb-2">Terminal Cursor</p>
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-primary">$</span>
                  <span>sidekick</span>
                  <span className="w-2 h-5 bg-primary terminal-cursor" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Timing & Easing */}
      <section className="py-16 px-4 md:px-8">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8">Timing & Easing</h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="glass-panel p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground font-mono text-xs">Animation</th>
                    <th className="text-left py-3 text-muted-foreground font-mono text-xs">Duration</th>
                    <th className="text-left py-3 text-muted-foreground font-mono text-xs">Easing</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-border/50">
                    <td className="py-3 text-foreground">Scroll reveal</td>
                    <td className="py-3 text-muted-foreground">600ms</td>
                    <td className="py-3 text-primary">cubic-bezier(0.16, 1, 0.3, 1)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 text-foreground">Funnel text</td>
                    <td className="py-3 text-muted-foreground">800ms</td>
                    <td className="py-3 text-primary">cubic-bezier(0.16, 1, 0.3, 1)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 text-foreground">Hover transitions</td>
                    <td className="py-3 text-muted-foreground">200-300ms</td>
                    <td className="py-3 text-primary">ease-out</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 text-foreground">Float</td>
                    <td className="py-3 text-muted-foreground">6s</td>
                    <td className="py-3 text-primary">ease-in-out infinite</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-foreground">Pulse glow</td>
                    <td className="py-3 text-muted-foreground">3s</td>
                    <td className="py-3 text-primary">ease-in-out infinite</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Animations;
