"use client";

/**
 * CursorTrail — Estela elegante del cursor.
 *
 * El puntero nativo se mantiene; al moverse deja partículas que flotan hacia
 * arriba y se desvanecen.
 *
 * - General/Events → chispas circulares con glow del accent.
 * - Weddings → corazones SVG champagne.
 *
 * Auto-deshabilita en touch devices (no hay cursor) y respeta
 * prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import { useVariant } from "./VariantProvider";

const HEART_SVG = `<svg viewBox="0 0 16 16" width="14" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M8 13.5l-5.5-5A3.5 3.5 0 1 1 8 4.5a3.5 3.5 0 1 1 5.5 4l-5.5 5z" fill="rgba(212,165,116,0.85)" stroke="rgba(199,31,92,0.6)" stroke-width="0.8"/></svg>`;

export function CursorTrail() {
  const { variant } = useVariant();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Skip on touch / coarse pointer / reduced motion
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    let lastX = 0;
    let lastY = 0;
    let lastEmit = 0;
    const minDistance = 22;
    const minInterval = 16;

    function emit(x: number, y: number) {
      if (!container) return;
      const el = document.createElement("span");
      el.className = "cursor-particle";
      el.style.left = `${x - 6}px`;
      el.style.top = `${y - 6}px`;
      if (variant === "weddings") {
        el.style.background = "transparent";
        el.style.mixBlendMode = "normal";
        el.innerHTML = HEART_SVG;
      }
      const dx = (Math.random() - 0.5) * 30;
      const dy = -16 - Math.random() * 24;
      const scale = 0.6 + Math.random() * 0.7;
      const dur = 800 + Math.random() * 500;
      el.animate(
        [
          { transform: `translate(0, 0) scale(${scale})`, opacity: 0.85 },
          { transform: `translate(${dx}px, ${dy}px) scale(${scale * 0.4})`, opacity: 0 },
        ],
        { duration: dur, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" }
      );
      container.appendChild(el);
      setTimeout(() => el.remove(), dur + 50);
    }

    function onMove(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();
      const dist = Math.hypot(x - lastX, y - lastY);
      if (dist > minDistance && now - lastEmit > minInterval) {
        emit(x, y);
        lastX = x;
        lastY = y;
        lastEmit = now;
      }
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, [variant]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9998 }}
    />
  );
}
