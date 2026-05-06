"use client";

import { useEffect } from "react";

/**
 * ScrollFx — barra de progreso superior + parallax aurora-blobs +
 * reveal-on-scroll observer. Adaptado del bundle para usar el .app-root
 * como contenedor de scroll real (en lugar de window).
 */
export function ScrollFx() {
  useEffect(() => {
    const root = (document.querySelector(".app-root") as HTMLElement | null) ?? null;
    const target: HTMLElement | Window = root ?? window;
    const bar = document.getElementById("scroll-progress");

    function getMetrics() {
      if (root) {
        return {
          top: root.scrollTop,
          max: root.scrollHeight - root.clientHeight,
        };
      }
      const el = document.documentElement;
      return { top: el.scrollTop, max: el.scrollHeight - el.clientHeight };
    }

    const onScroll = () => {
      const { top, max } = getMetrics();
      const p = max > 0 ? top / max : 0;
      if (bar) bar.style.transform = `scaleX(${p})`;
      document.querySelectorAll<HTMLElement>(".aurora-blob").forEach((el, i) => {
        const y = top * (0.05 + i * 0.04);
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    };

    target.addEventListener("scroll", onScroll, { passive: true } as AddEventListenerOptions);
    onScroll();

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
      target.removeEventListener("scroll", onScroll as EventListener);
      io.disconnect();
    };
  }, []);

  return <div id="scroll-progress" className="scroll-progress" aria-hidden />;
}
