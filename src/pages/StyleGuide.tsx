import Layout from '@/components/Layout';
import FunnelText from '@/components/FunnelText';
import ScrollReveal from '@/components/ScrollReveal';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Search, Code } from 'lucide-react';

const StyleGuide = () => {
  const colors = [
    { name: 'Primary (Cyan)', variable: '--primary', class: 'bg-primary' },
    { name: 'Accent (Violet)', variable: '--accent', class: 'bg-accent' },
    { name: 'Background', variable: '--background', class: 'bg-background border' },
    { name: 'Foreground', variable: '--foreground', class: 'bg-foreground' },
    { name: 'Muted', variable: '--muted', class: 'bg-muted' },
    { name: 'Card', variable: '--card', class: 'bg-card border' },
    { name: 'Border', variable: '--border', class: 'bg-border' },
    { name: 'Destructive', variable: '--destructive', class: 'bg-destructive' },
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="container max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <span className="font-mono text-xs text-primary uppercase tracking-wider mb-4 block">
              Design System
            </span>
          </ScrollReveal>
          <FunnelText
            text="Style Guide"
            as="h1"
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            delay={100}
          />
          <ScrollReveal delay={300}>
            <p className="text-xl text-muted-foreground">
              The visual language of Sidekick.ai
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Colors */}
      <section className="py-16 px-4 md:px-8">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8">Colors</h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colors.map((color, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className="glass-panel p-4">
                  <div className={`w-full h-16 rounded-lg mb-3 ${color.class}`} />
                  <p className="font-medium text-sm text-foreground">{color.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{color.variable}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="py-16 px-4 md:px-8 bg-muted/10">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8">Typography</h2>
          </ScrollReveal>
          
          <div className="space-y-8">
            <ScrollReveal delay={100}>
              <div className="glass-panel p-6">
                <p className="font-mono text-xs text-primary mb-2">Display / Headlines</p>
                <p className="font-display text-4xl font-bold text-foreground">Space Grotesk</p>
                <p className="text-muted-foreground mt-2">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="glass-panel p-6">
                <p className="font-mono text-xs text-primary mb-2">Monospace / Code</p>
                <p className="font-mono text-2xl text-foreground">Geist Mono</p>
                <p className="font-mono text-muted-foreground mt-2">
                  const sidekick = new AI(); // 0123456789
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="glass-panel p-6 space-y-4">
                <p className="font-mono text-xs text-primary">Scale</p>
                <h1 className="text-5xl font-bold">Heading 1</h1>
                <h2 className="text-4xl font-bold">Heading 2</h2>
                <h3 className="text-3xl font-bold">Heading 3</h3>
                <h4 className="text-2xl font-semibold">Heading 4</h4>
                <p className="text-base">Body text - Regular paragraph styling</p>
                <p className="text-sm text-muted-foreground">Small text - Secondary content</p>
                <p className="font-mono text-xs">Mono - Code and technical labels</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Components */}
      <section className="py-16 px-4 md:px-8">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8">Components</h2>
          </ScrollReveal>

          {/* Buttons */}
          <ScrollReveal delay={100}>
            <div className="glass-panel p-6 mb-6">
              <p className="font-mono text-xs text-primary mb-4">Buttons</p>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button className="bg-primary text-primary-foreground border-glow">Primary Glow</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button size="lg">Large</Button>
                <Button size="sm">Small</Button>
              </div>
            </div>
          </ScrollReveal>

          {/* Inputs */}
          <ScrollReveal delay={200}>
            <div className="glass-panel p-6 mb-6">
              <p className="font-mono text-xs text-primary mb-4">Inputs</p>
              <div className="max-w-md space-y-4">
                <Input placeholder="Default input" className="bg-muted/50 border-border/50" />
                <Input 
                  placeholder="Focused state" 
                  className="bg-muted/50 border-primary/50 ring-1 ring-primary/20" 
                />
                <Input 
                  placeholder="Error state" 
                  className="bg-muted/50 border-destructive" 
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Cards */}
          <ScrollReveal delay={300}>
            <div className="glass-panel p-6 mb-6">
              <p className="font-mono text-xs text-primary mb-4">Feature Cards</p>
              <div className="grid md:grid-cols-3 gap-4">
                <FeatureCard
                  icon={Zap}
                  title="Cyan Glow"
                  description="Default feature card with cyan accent glow on hover."
                  glowColor="cyan"
                />
                <FeatureCard
                  icon={Search}
                  title="Violet Glow"
                  description="Alternative feature card with violet accent glow."
                  glowColor="violet"
                />
                <FeatureCard
                  icon={Code}
                  title="Interactive"
                  description="Hover to see the subtle lift and glow effect."
                  glowColor="cyan"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Glass Panels */}
          <ScrollReveal delay={400}>
            <div className="glass-panel p-6">
              <p className="font-mono text-xs text-primary mb-4">Glass Panels</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-panel p-4">
                  <p className="text-sm text-foreground">Standard glass panel</p>
                  <p className="text-xs text-muted-foreground">With backdrop blur and subtle border</p>
                </div>
                <div className="glass-panel-hover p-4">
                  <p className="text-sm text-foreground">Hover variant</p>
                  <p className="text-xs text-muted-foreground">Hover for glow effect</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Effects */}
      <section className="py-16 px-4 md:px-8 bg-muted/10">
        <div className="container max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8">Effects</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal delay={100}>
              <div className="glass-panel p-6">
                <p className="font-mono text-xs text-primary mb-4">Text Glow</p>
                <p className="text-2xl font-bold text-primary text-glow">Cyan Glow Text</p>
                <p className="text-2xl font-bold text-accent text-glow-violet mt-2">Violet Glow Text</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="glass-panel p-6">
                <p className="font-mono text-xs text-primary mb-4">Border Glow</p>
                <div className="inline-block p-4 rounded-lg border border-primary border-glow">
                  Cyan border glow
                </div>
                <div className="inline-block p-4 rounded-lg border border-accent border-glow-violet mt-2">
                  Violet border glow
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="glass-panel p-6">
                <p className="font-mono text-xs text-primary mb-4">Gradient Text</p>
                <p className="text-3xl font-bold gradient-text">Gradient Heading</p>
                <p className="text-xl font-semibold gradient-text-cyan mt-2">Cyan Gradient</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="glass-panel p-6">
                <p className="font-mono text-xs text-primary mb-4">Animated Underline</p>
                <a href="#" className="text-lg animated-underline">Hover for underline</a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StyleGuide;
