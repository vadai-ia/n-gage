"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleField — connected nodes (port directo del bundle).
 * Lee --accent-lead-rgb del :root (que cambia con la variante).
 */
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener("resize", resize);

    const N = 38;
    const dpr = window.devicePixelRatio || 1;
    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    const nodes: Node[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25 * dpr,
      vy: (Math.random() - 0.5) * 0.25 * dpr,
      r: (1 + Math.random() * 1.5) * dpr,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accentRgb =
        getComputedStyle(document.documentElement).getPropertyValue("--accent-lead-rgb").trim() || "255,45,120";

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          const max = 130 * dpr;
          if (d < max) {
            ctx.strokeStyle = `rgba(${accentRgb}, ${(1 - d / max) * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${accentRgb}, 0.6)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5, pointerEvents: "none" }}
      aria-hidden
    />
  );
}
