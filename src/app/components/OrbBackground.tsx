'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface Orb {
  x: number;
  y: number;
  r: number;
  color: string;
  // Base drift velocity
  vx: number;
  vy: number;
  // How strongly this orb follows the mouse (0–1)
  mouseInfluence: number;
}

const LIGHT_COLORS = [
  'rgba(30, 64, 175, 0.18)',    // Deep Blue
  'rgba(59, 130, 246, 0.14)',   // Blue
  'rgba(5, 150, 105, 0.10)',    // Emerald
];

const DARK_COLORS = [
  'rgba(59, 130, 246, 0.16)',   // Blue
  'rgba(30, 64, 175, 0.12)',    // Deep Blue
  'rgba(5, 150, 105, 0.08)',    // Emerald
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
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
    const fadeTarget = isDark ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)';

    // Mouse position (starts at center)
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize orbs
    const orbs: Orb[] = [
      { x: width * 0.2, y: height * 0.3, r: 300, color: colors[0], vx: 0.3, vy: 0.15, mouseInfluence: 0.08 },
      { x: width * 0.8, y: height * 0.2, r: 400, color: colors[1], vx: -0.2, vy: 0.25, mouseInfluence: 0.05 },
      { x: width * 0.5, y: height * 0.8, r: 350, color: colors[2], vx: 0.15, vy: -0.2, mouseInfluence: 0.06 },
    ];

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      orbs.forEach((orb) => {
        // Attract toward mouse with easing
        const dx = mouseX - orb.x;
        const dy = mouseY - orb.y;
        orb.x += dx * orb.mouseInfluence + orb.vx;
        orb.y += dy * orb.mouseInfluence + orb.vy;

        // Soft bounce off edges
        if (orb.x < -100) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + 100) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -100) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + 100) orb.vy = -Math.abs(orb.vy);

        // Draw orb with radial gradient
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
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
