import { useEffect, useRef } from 'react';

// Falling code characters in the background (skipped if the user prefers reduced motion)
export default function Matrix() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = ref.current!, ctx = c.getContext('2d')!;
    const chars = '01{}[]<>/=;#$%&*+commitpushmerge'.split('');
    let drops: number[] = [], raf = 0;
    const resize = () => {
      c.width = innerWidth; c.height = innerHeight;
      drops = Array(Math.floor(c.width / 18)).fill(0).map(() => Math.random() * -50);
    };
    resize(); addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(8,12,8,0.12)'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#39ff88'; ctx.font = '14px monospace';
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 18, y * 18);
        drops[i] = y * 18 > c.height && Math.random() > 0.975 ? 0 : y + 0.5;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="matrix" aria-hidden />;
}
