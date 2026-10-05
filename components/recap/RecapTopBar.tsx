"use client";

import Logo from "@/components/brand/Logo";
import { useRecap } from "@/lib/contexts/RecapContext";

export default function RecapTopBar({ isLive }: { isLive: boolean }) {
  const { data } = useRecap();
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl"
      style={{ background: "rgba(7,7,15,0.72)", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-4">
        <Logo size={24} showText={false} />
        <p className="flex-1 truncate font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {data.event.name}
        </p>
        {isLive ? (
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ background: "rgba(16,185,129,0.14)", color: "#34D399" }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#34D399" }} aria-hidden />
            En vivo
          </span>
        ) : (
          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.06)", color: "var(--fg-2)" }}>
            Recuerdos
          </span>
        )}
      </div>
    </header>
  );
}
