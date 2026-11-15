import { useEffect, useRef } from 'react';
import type { BackgroundMode } from '../types/roadmap';

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

interface AnimatedBackgroundProps {
  mode: BackgroundMode;
}

export function AnimatedBackground({ mode }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pointer = { x: width * 0.5, y: height * 0.25, active: false };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();

    const nodeCount = width < 768 ? 22 : 40;
    const nodes: NodePoint[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.26,
      radius: 1.5 + Math.random() * 2.2,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };

    const handleMouseLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let tick = 0;
    const isDarkCanvas = mode === 'black';

    const renderFrame = () => {
      tick += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Trajectory wave lines
      ctx.save();
      ctx.strokeStyle = isDarkCanvas ? 'rgba(56, 189, 248, 0.18)' : 'rgba(15, 23, 42, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const baseY = 120 + i * 95;
        for (let x = 0; x <= width; x += 28) {
          const wave = Math.sin(x * 0.0032 + tick + i * 1.4) * (18 + i * 7);
          const y = baseY + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Update & draw constellation nodes
      const maxDist = width < 768 ? 115 : 155;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          if (pointer.active) {
            const dx = pointer.x - node.x;
            const dy = pointer.y - node.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 40 && dist < 210) {
              node.x += dx * 0.0018;
              node.y += dy * 0.0018;
            }
          }

          if (node.x < -20) node.x = width + 20;
          if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          if (node.y > height + 20) node.y = -20;
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isDarkCanvas ? 0.24 : 0.13);
            ctx.strokeStyle = isDarkCanvas
              ? `rgba(56, 189, 248, ${alpha.toFixed(3)})`
              : `rgba(17, 19, 24, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        const glow = (isDarkCanvas ? 0.35 : 0.22) + 0.18 * Math.sin(tick * 2.2 + node.pulsePhase);
        ctx.fillStyle = isDarkCanvas
          ? `rgba(125, 211, 252, ${glow.toFixed(3)})`
          : `rgba(17, 19, 24, ${glow.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  const containerBgClass =
    mode === 'black'
      ? 'bg-[#111318]'
      : mode === 'white'
      ? 'bg-white'
      : 'bg-gradient-to-b from-[#111318] via-[#111318] via-30% to-white to-35%';

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-300 no-print ${containerBgClass}`}
      aria-hidden="true"
    >
      {/* Subtle architectural grid backdrop */}
      <div
        className={`blueprint-grid-bg absolute inset-0 ${
          mode === 'black' ? 'opacity-90' : 'opacity-60'
        }`}
      />
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            mode === 'black'
              ? 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56, 189, 248, 0.14), transparent 70%)'
              : 'radial-gradient(ellipse 80% 45% at 50% 0%, rgba(17, 19, 24, 0.06), transparent 68%)',
        }}
      />
      {/* Interactive orbital trajectory & constellation canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
