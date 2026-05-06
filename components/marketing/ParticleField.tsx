"use client";

import { useEffect, useRef } from "react";
import { useVariant } from "./VariantProvider";

const COLOR_SETS: Record<"general" | "weddings" | "events", string[]> = {
  general: ["#FF2D78", "#7B2FBE", "#1A6EFF", "#FFB800"],
  weddings: ["#D4A574", "#C9A87C", "#E8D5B8", "#B5895C"],
  events: ["#1A6EFF", "#3A85FF", "#7B2FBE", "#00D4FF"],
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
};

type Props = {
  density?: number;
  className?: string;
  speed?: number;
};

export function ParticleField({ density = 50, className, speed = 0.18 }: Props) {
  const { variant } = useVariant();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const COLORS = COLOR_SETS[variant];
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !ctx) return;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.scale(dpr, dpr);
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * clientWidth,
        y: Math.random() * clientHeight,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: 0.6 + Math.random() * 1.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.2 + Math.random() * 0.5,
      }));
    }

    function draw() {
      if (!canvas || !ctx) return;
      const { clientWidth, clientHeight } = canvas;
      ctx.clearRect(0, 0, clientWidth, clientHeight);

      for (const p of particles) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = clientWidth + 10;
          if (p.x > clientWidth + 10) p.x = -10;
          if (p.y < -10) p.y = clientHeight + 10;
          if (p.y > clientHeight + 10) p.y = -10;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [density, speed, variant]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    />
  );
}
