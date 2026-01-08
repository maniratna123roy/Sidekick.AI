import { useEffect, useRef } from 'react';

interface GlowingNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
}

const AnimatedGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GlowingNode[]>([]);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize glowing nodes
    const nodeCount = 6;
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 3 + 2,
      opacity: Math.random() * 0.5 + 0.3,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const drawGrid = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const gridSize = 60;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw perspective grid
      ctx.save();
      
      // Grid lines with wave distortion
      const perspectiveY = height * 0.3;
      const horizonY = height * 0.15;
      
      // Horizontal lines with perspective
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const y = horizonY + (height - horizonY) * Math.pow(t, 1.5);
        const waveOffset = Math.sin(time * 0.001 + i * 0.3) * 2;
        
        const alpha = 0.03 + t * 0.05;
        ctx.strokeStyle = `hsla(174, 100%, 50%, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y + waveOffset);
        ctx.lineTo(width, y + waveOffset);
        ctx.stroke();
      }

      // Vertical lines with perspective convergence
      const vanishX = width / 2;
      const lineCount = Math.ceil(width / gridSize) + 10;
      
      for (let i = -lineCount / 2; i <= lineCount / 2; i++) {
        const baseX = vanishX + i * gridSize;
        const waveOffset = Math.sin(time * 0.0008 + i * 0.2) * 3;
        
        const alpha = 0.04 - Math.abs(i) * 0.002;
        if (alpha <= 0) continue;
        
        ctx.strokeStyle = `hsla(174, 100%, 50%, ${Math.max(0, alpha)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(vanishX + waveOffset, horizonY);
        ctx.lineTo(baseX + waveOffset, height);
        ctx.stroke();
      }

      ctx.restore();

      // Draw and update glowing nodes
      nodesRef.current.forEach((node, index) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;
        node.pulsePhase += 0.02;

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));

        // Calculate pulsing opacity
        const pulseOpacity = node.opacity * (0.5 + 0.5 * Math.sin(node.pulsePhase));

        // Draw glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.size * 20
        );
        gradient.addColorStop(0, `hsla(174, 100%, 50%, ${pulseOpacity})`);
        gradient.addColorStop(0.3, `hsla(174, 100%, 50%, ${pulseOpacity * 0.3})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = `hsla(174, 100%, 70%, ${pulseOpacity * 1.5})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between nearby nodes
      ctx.strokeStyle = 'hsla(174, 100%, 50%, 0.05)';
      ctx.lineWidth = 0.5;
      nodesRef.current.forEach((node, i) => {
        nodesRef.current.slice(i + 1).forEach((other) => {
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 300) {
            const alpha = (1 - distance / 300) * 0.1;
            ctx.strokeStyle = `hsla(174, 100%, 50%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });
    };

    const animate = (time: number) => {
      timeRef.current = time;
      drawGrid(time);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'linear-gradient(180deg, hsl(240 10% 4%) 0%, hsl(240 12% 6%) 50%, hsl(240 10% 3%) 100%)'
      }}
    />
  );
};

export default AnimatedGridBackground;
