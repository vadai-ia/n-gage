"use client";

import { Heart, Images, Network, Sparkles, Trophy, type LucideIcon } from "lucide-react";

export type RecapTab = "resumen" | "matches" | "red" | "premios" | "fotos";

export const RECAP_TABS: { id: RecapTab; label: string; icon: LucideIcon }[] = [
  { id: "resumen", label: "Resumen", icon: Sparkles },
  { id: "matches", label: "Matches", icon: Heart },
  { id: "red", label: "Conexiones", icon: Network },
  { id: "premios", label: "Premios", icon: Trophy },
  { id: "fotos", label: "Fotos", icon: Images },
];

type Props = {
  active: RecapTab;
  onChange: (tab: RecapTab) => void;
  counts: Partial<Record<RecapTab, number>>;
};

export default function RecapBottomNav({ active, onChange, counts }: Props) {
  return (
    <nav
      aria-label="Secciones del resumen"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <ul
        className="flex w-full max-w-md items-stretch justify-between gap-1 rounded-3xl p-1.5 backdrop-blur-xl"
        style={{ background: "rgba(15,15,26,0.82)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}
      >
        {RECAP_TABS.map(({ id, label, icon: Icon }) => {
          const isActive = id === active;
          const count = counts[id];
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? "page" : undefined}
                className="relative flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                style={{
                  background: isActive ? "rgba(255,45,120,0.14)" : "transparent",
                  color: isActive ? "#FF2D78" : "var(--fg-2)",
                }}
              >
                <span className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 2} aria-hidden />
                  {!!count && count > 0 && (
                    <span
                      className="absolute -right-3 -top-1.5 min-w-[18px] rounded-full px-1 text-[10px] font-bold leading-[18px] text-white font-mono"
                      style={{ background: "#FF2D78" }}
                      aria-label={`${count}`}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
