"use client";

import { useState } from "react";
import type { RecapTimelineBucket } from "@/lib/recap/types";
import { formatBucketLabel, plural } from "@/lib/recap/format";

type Props = {
  buckets: RecapTimelineBucket[];
  bucketMinutes: number;
  peak: RecapTimelineBucket | null;
};

const SERIES = [
  { key: "likes", label: "Likes", color: "#FF2D78" },
  { key: "superLikes", label: "Super likes", color: "#FFB800" },
  { key: "matches", label: "Matches", color: "#1A6EFF" },
] as const;

const CHART_H = 160;

export default function ActivityTimeline({ buckets, bucketMinutes, peak }: Props) {
  // peak llega serializado desde el server: se ubica por timestamp, no por referencia
  const peakIndex = peak ? buckets.findIndex((b) => b.t === peak.t) : -1;
  const [selected, setSelected] = useState<number | null>(peakIndex >= 0 ? peakIndex : null);
  if (buckets.length === 0) return null;

  const totals = buckets.map((b) => b.likes + b.superLikes + b.matches);
  const max = Math.max(1, ...totals);
  const active = selected !== null ? buckets[selected] : null;
  // Etiquetas del eje: ~5 marcas repartidas
  const labelEvery = Math.max(1, Math.ceil(buckets.length / 5));

  return (
    <div>
      {/* Detalle del bloque seleccionado */}
      <div className="mb-4 min-h-[48px] rounded-2xl px-4 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }} aria-live="polite">
        {active ? (
          <>
            <p className="text-xs" style={{ color: "var(--fg-3)" }}>
              {formatBucketLabel(active.t, bucketMinutes)}
              {selected === peakIndex && <span className="ml-2 font-bold" style={{ color: "#FFB800" }}>Momento más intenso</span>}
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {plural(active.likes, "like", "likes")} · {plural(active.superLikes, "super like", "super likes")} · {plural(active.matches, "match", "matches")}
            </p>
          </>
        ) : (
          <p className="pt-2 text-sm" style={{ color: "var(--fg-3)" }}>Toca una barra para ver qué pasó en ese momento</p>
        )}
      </div>

      <div className="flex items-end gap-[3px]" style={{ height: CHART_H }} role="group" aria-label="Actividad a lo largo del evento">
        {buckets.map((b, i) => {
          const isSelected = i === selected;
          return (
            <button
              key={b.t}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`${formatBucketLabel(b.t, bucketMinutes)}: ${b.likes} likes, ${b.superLikes} super likes, ${b.matches} matches`}
              aria-pressed={isSelected}
              className="group relative flex h-full flex-1 cursor-pointer flex-col justify-end rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
              style={{ minWidth: 4, background: isSelected ? "rgba(255,255,255,0.06)" : "transparent" }}
            >
              <span className="flex w-full flex-col-reverse overflow-hidden rounded-t-md transition-opacity" style={{ opacity: selected === null || isSelected ? 1 : 0.55 }}>
                {SERIES.map((s) => {
                  const v = b[s.key];
                  if (v === 0) return null;
                  return <span key={s.key} style={{ height: (v / max) * (CHART_H - 8), background: s.color }} />;
                })}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex gap-[3px]" aria-hidden>
        {buckets.map((b, i) => (
          <span key={b.t} className="flex-1 overflow-visible whitespace-nowrap text-[10px] font-mono" style={{ color: "var(--fg-3)", minWidth: 4 }}>
            {i % labelEvery === 0 ? formatBucketLabel(b.t, bucketMinutes) : ""}
          </span>
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-4" aria-label="Leyenda">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-xs" style={{ color: "var(--fg-2)" }}>
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
