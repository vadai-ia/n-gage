"use client";

/**
 * ScrollFx — efectos visuales globales que dependen del scroll:
 *   - Barra de progreso superior con gradient de la variante.
 *   - Reveal-on-scroll para cualquier elemento con clase `.reveal`
 *     (añade `.in` al entrar al viewport).
 *
 * El scroll real vive en `.app-root` (no en <html>) por la arquitectura del repo.
 */

import { useEffect, useRef } from "react";

export function ScrollFx() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector(".app-root") as HTMLElement | null;
    const target: HTMLElement | Window = root ?? window;

    function update() {
      const bar = barRef.current;
      if (!bar) return;
      let scrolled: number;
      let max: number;
      if (root) {
        scrolled = root.scrollTop;
        max = root.scrollHeight - root.clientHeight;
      } else {
        scrolled = window.scrollY;
        max = document.documentElement.scrollHeight - window.innerHeight;
      }
      const pct = max > 0 ? scrolled / max : 0;
      bar.style.transform = `scaleX(${pct})`;
    }
    update();
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // Reveal-on-scroll
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px", root: root ?? null }
    );
    els.forEach((el) => io.observe(el));

    return () => {
      target.removeEventListener("scroll", update as EventListener);
      window.removeEventListener("resize", update);
      io.disconnect();
    };
  }, []);

  return <div ref={barRef} className="scroll-progress-v" aria-hidden />;
}
