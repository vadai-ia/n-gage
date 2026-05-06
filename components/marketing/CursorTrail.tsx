"use client";

import { useEffect, useRef } from "react";

/**
 * CursorTrail — Port directo del bundle.
 * General/Events: chispas glow accent. Weddings: corazones champagne.
 */
export function CursorTrail() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = layerRef.current;
    if (!layer) return;

    let lastX = 0;
    let lastY = 0;
    let lastT = 0;

    const variantOf = () => document.body.getAttribute("data-variant") || "general";
    const accentColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent-lead-rgb").trim() || "255,45,120";

    function spawn(x: number, y: number, _speed: number, v: string) {
      if (!layer) return;
      const el = document.createElement("div");
      el.className = "trail-particle";
      const rgb = accentColor();
      const jitterX = (Math.random() - 0.5) * 12;
      const jitterY = (Math.random() - 0.5) * 12;
      const driftX = (Math.random() - 0.5) * 24;
      const driftY = -10 - Math.random() * 30;
      const dur = 700 + Math.random() * 500;

      if (v === "weddings") {
        const size = 14 + Math.random() * 8;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.background = "transparent";
        el.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%" style="filter: drop-shadow(0 0 6px rgba(${rgb},0.6));">
          <path d="M12 21s-7-4.5-9.5-9C0.5 7.5 3 3 7 3c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4.5 4.5 9-2.5 4.5-9.5 9-9.5 9z"
            fill="rgb(${rgb})" opacity="0.85"/></svg>`;
      } else {
        const size = 6 + Math.random() * 8 + Math.min(_speed / 8, 6);
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.background = `radial-gradient(circle, rgba(${rgb},0.95) 0%, rgba(${rgb},0.6) 40%, rgba(${rgb},0) 75%)`;
        el.style.filter = "blur(0.5px)";
      }

      el.style.left = `${x + jitterX}px`;
      el.style.top = `${y + jitterY}px`;
      el.style.transform = `translate(-50%, -50%) scale(1) rotate(${(Math.random() - 0.5) * 40}deg)`;
      el.style.opacity = "1";
      el.style.transition = `transform ${dur}ms cubic-bezier(.2,.6,.3,1), opacity ${dur}ms ease-out`;
      layer.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(0.2) rotate(${
          (Math.random() - 0.5) * 120
        }deg)`;
        el.style.opacity = "0";
      });
      setTimeout(() => el.remove(), dur + 50);
    }

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastT < 16) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.hypot(dx, dy);
      lastT = now;
      lastX = e.clientX;
      lastY = e.clientY;
      if (speed < 1.5) return;
      const v = variantOf();
      const count = v === "weddings" ? 1 : Math.min(2, Math.ceil(speed / 18));
      for (let i = 0; i < count; i++) spawn(e.clientX, e.clientY, speed, v);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={layerRef}
      className="trail-layer"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998 }}
      aria-hidden
    />
  );
}
