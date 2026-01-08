import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  glowColor?: 'cyan' | 'violet';
  className?: string;
}

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  glowColor = 'cyan',
  className = '' 
}: FeatureCardProps) => {
  const glowClasses = glowColor === 'cyan' 
    ? 'group-hover:border-primary/40 group-hover:shadow-[0_0_30px_-10px_hsl(174_100%_50%_/_0.3)]'
    : 'group-hover:border-accent/40 group-hover:shadow-[0_0_30px_-10px_hsl(263_70%_58%_/_0.3)]';

  const iconBgClass = glowColor === 'cyan'
    ? 'bg-primary/10 border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40'
    : 'bg-accent/10 border-accent/20 group-hover:bg-accent/20 group-hover:border-accent/40';

  const iconTextClass = glowColor === 'cyan' ? 'text-primary' : 'text-accent';

  return (
    <div 
      className={`group glass-panel p-6 md:p-8 transition-all duration-500 hover:-translate-y-1 ${glowClasses} ${className}`}
    >
      <div className={`w-12 h-12 rounded-xl ${iconBgClass} border flex items-center justify-center mb-5 transition-all duration-300`}>
        <Icon className={`w-6 h-6 ${iconTextClass}`} />
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
