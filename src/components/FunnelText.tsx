import { useEffect, useRef, useState } from 'react';

interface FunnelTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  delay?: number;
  staggerDelay?: number;
}

const FunnelText = ({ 
  text, 
  className = '', 
  as: Component = 'h1',
  delay = 0,
  staggerDelay = 50
}: FunnelTextProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="overflow-hidden">
      <Component className={className}>
        {words.map((word, index) => (
          <span
            key={index}
            className="inline-block mr-[0.25em]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible 
                ? 'translateY(0) scaleX(1)' 
                : 'translateY(30px) scaleX(1.1)',
              letterSpacing: isVisible ? '0' : '0.05em',
              transition: `all 800ms cubic-bezier(0.16, 1, 0.3, 1)`,
              transitionDelay: `${delay + index * staggerDelay}ms`,
            }}
          >
            {word}
          </span>
        ))}
      </Component>
    </div>
  );
};

export default FunnelText;
