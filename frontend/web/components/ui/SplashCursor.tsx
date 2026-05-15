'use client';

import { useEffect, useRef } from 'react';

type Props = {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  RAINBOW_MODE?: boolean;
  COLOR?: string;
  BACK_COLOR?: { r: number; g: number; b: number };
};

export default function SplashCursor({
  RAINBOW_MODE = true,
  COLOR = '#62b3ff',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const trails: Array<{ x: number; y: number; vx: number; vy: number; life: number; hue: number }> = [];
    let mouseX = -1000;
    let mouseY = -1000;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const pointer = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      for (let i = 0; i < 3; i++) {
        trails.push({
          x: mouseX,
          y: mouseY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          life: 1,
          hue: Math.random() * 360,
        });
      }
    };
    window.addEventListener('pointermove', pointer);

    const hexToRgb = (hex: string) => {
      const raw = hex.replace('#', '');
      const r = parseInt(raw.substring(0, 2), 16);
      const g = parseInt(raw.substring(2, 4), 16);
      const b = parseInt(raw.substring(4, 6), 16);
      return { r, g, b };
    };

    const staticColor = hexToRgb(COLOR);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.x += t.vx;
        t.y += t.vy;
        t.life -= 0.018;
        if (t.life <= 0) {
          trails.splice(i, 1);
          continue;
        }

        const radius = 16 * t.life;
        const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, radius);
        if (RAINBOW_MODE) {
          grad.addColorStop(0, `hsla(${t.hue}, 100%, 60%, ${0.18 * t.life})`);
        } else {
          grad.addColorStop(0, `rgba(${staticColor.r}, ${staticColor.g}, ${staticColor.b}, ${0.2 * t.life})`);
        }
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', pointer);
    };
  }, [RAINBOW_MODE, COLOR]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: 'screen',
      }}
      aria-hidden="true"
    />
  );
}
