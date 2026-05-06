"use client";

/**
 * VariantSwitcher — Pill segmented control que navega entre las 3 variantes:
 *   N'GAGE (general) · / WEDDINGS (bodas) · / EVENTS (eventos)
 *
 * - Posicionamiento: lo controla el padre (suele ir en el Navbar).
 * - Indicador animado que se desliza al cambiar.
 * - Usa <Link> de Next para preservar SEO + history.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { variantFromPath, VARIANT_PATHS, type Variant } from "@/lib/landing/variant";

const ITEMS: { variant: Variant; label: string }[] = [
  { variant: "general", label: "N'GAGE" },
  { variant: "weddings", label: "/ WEDDINGS" },
  { variant: "events", label: "/ EVENTS" },
];

export function VariantSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const active = variantFromPath(pathname);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const update = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const activeBtn = wrap.querySelector<HTMLAnchorElement>(`[data-variant-btn="${active}"]`);
      if (activeBtn) {
        setIndicator({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
      }
    };
    update();
    const t = setTimeout(update, 80); // re-check after fonts/layout settle
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
    };
  }, [active]);

  return (
    <nav
      ref={wrapRef}
      role="tablist"
      aria-label="Variante de landing"
      className={`relative inline-flex items-center gap-0.5 p-[5px] rounded-full ${className}`}
      style={{
        background: "var(--v-bg-2)",
        border: "1px solid var(--v-line-2)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      <span
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          top: 5,
          bottom: 5,
          left: indicator.left,
          width: indicator.width,
          background: "var(--v-gradient)",
          opacity: 0.18,
          transition: "left 0.45s cubic-bezier(.2,.85,.25,1), width 0.45s cubic-bezier(.2,.85,.25,1)",
          boxShadow: "0 0 24px rgba(var(--v-accent-rgb), 0.25)",
          border: "1px solid rgba(var(--v-accent-rgb), 0.45)",
          zIndex: 0,
        }}
      />
      {ITEMS.map((item) => {
        const isActive = item.variant === active;
        return (
          <Link
            key={item.variant}
            href={VARIANT_PATHS[item.variant]}
            data-variant-btn={item.variant}
            role="tab"
            aria-selected={isActive}
            className="relative px-3.5 py-2.5 rounded-full whitespace-nowrap transition-colors"
            style={{
              color: isActive ? "var(--v-fg)" : "var(--v-fg-3)",
              zIndex: 1,
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
