'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface Orb {
  x: number;
  y: number;
  r: number;
  color: string;
  vx: number;
  vy: number;
  mouseInfluence: number;
}

interface StaticOrb {
  cx: number; // center x as fraction of width
  cy: number; // center y as fraction of height
  rx: number; // x radius as fraction of width
  ry: number; // y radius as fraction of height
  color: string;
}

const LIGHT_ANIMATED = [
  'rgba(30, 64, 175, 0.13)',
  'rgba(59, 130, 246, 0.10)',
];

const DARK_ANIMATED = [
  'rgba(59, 130, 246, 0.11)',
  'rgba(30, 64, 175, 0.08)',
];

const LIGHT_STATIC: StaticOrb[] = [
  { cx: 0.15, cy: 0.1,  rx: 0.35, ry: 0.35, color: 'rgba(147, 170, 255, 0.30)' },
  { cx: 0.75, cy: 0.05, rx: 0.25, ry: 0.25, color: 'rgba(120, 150, 245, 0.18)' },
  { cx: 0.85, cy: 0.85, rx: 0.35, ry: 0.30, color: 'rgba(216, 180, 254, 0.25)' },
  { cx: 0.10, cy: 0.90, rx: 0.25, ry: 0.25, color: 'rgba(253, 186, 210, 0.16)' },
];

const DARK_STATIC: StaticOrb[] = [
  { cx: 0.15, cy: 0.1,  rx: 0.35, ry: 0.35, color: 'rgba(147, 170, 255, 0.10)' },
  { cx: 0.75, cy: 0.05, rx: 0.25, ry: 0.25, color: 'rgba(120, 150, 245, 0.07)' },
  { cx: 0.85, cy: 0.85, rx: 0.35, ry: 0.30, color: 'rgba(216, 180, 254, 0.09)' },
  { cx: 0.10, cy: 0.90, rx: 0.25, ry: 0.25, color: 'rgba(253, 186, 210, 0.07)' },
];

export function OrbBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const isDark = resolvedTheme === 'dark';
    const animColors = isDark ? DARK_ANIMATED : LIGHT_ANIMATED;
    const staticOrbs = isDark ? DARK_STATIC : LIGHT_STATIC;
    const fadeTarget = isDark ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)';

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animated orbs: large, gentle movement
    const orbs: Orb[] = [
      { x: width * 0.25, y: height * 0.35, r: 450, color: animColors[0], vx: 0.15, vy: 0.08, mouseInfluence: 0.03 },
      { x: width * 0.75, y: height * 0.25, r: 480, color: animColors[1], vx: -0.12, vy: 0.12, mouseInfluence: 0.02 },
    ];

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw static orbs first (background layer)
      staticOrbs.forEach((s) => {
        const cx = s.cx * width;
        const cy = s.cy * height;
        const r = Math.max(s.rx * width, s.ry * height);

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, s.color);
        g.addColorStop(1, fadeTarget);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Draw animated orbs on top
      orbs.forEach((orb) => {
        const dx = mouseX - orb.x;
        const dy = mouseY - orb.y;
        orb.x += dx * orb.mouseInfluence + orb.vx;
        orb.y += dy * orb.mouseInfluence + orb.vy;

        if (orb.x < -200) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + 200) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -200) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + 200) orb.vy = -Math.abs(orb.vy);

        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, orb.color);
        g.addColorStop(1, fadeTarget);

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
