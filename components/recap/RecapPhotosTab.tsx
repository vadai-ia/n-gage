"use client";

import { useMemo, useState } from "react";
import { Camera, Download, Loader2 } from "lucide-react";
import { useRecap } from "@/lib/contexts/RecapContext";
import { recapImage } from "@/lib/recap/images";
import { plural } from "@/lib/recap/format";
import RecapCard from "./RecapCard";
import PersonAvatar from "./PersonAvatar";
import PhotoLightbox from "./PhotoLightbox";

export default function RecapPhotosTab() {
  const { data, personById } = useRecap();
  const [by, setBy] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zipState, setZipState] = useState<"idle" | "loading" | "error">("idle");
  const [zipError, setZipError] = useState<string | null>(null);

  const photographers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of data.photos) if (p.by) counts.set(p.by, (counts.get(p.by) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [data.photos]);

  const photos = useMemo(() => (by ? data.photos.filter((p) => p.by === by) : data.photos), [data.photos, by]);

  async function downloadAll() {
    setZipState("loading");
    setZipError(null);
    try {
      const res = await fetch(`/api/v1/recap/${data.event.slug}/photos-zip?format=json`);
      const body = await res.json();
      if (!res.ok || !body.url) throw new Error(body.error ?? "No pudimos preparar el ZIP");
      window.location.href = body.url;
      setZipState("idle");
    } catch (err) {
      setZipError(err instanceof Error ? err.message : "No pudimos preparar el ZIP");
      setZipState("error");
    }
  }

  if (data.photos.length === 0) {
    return (
      <div className="pt-6">
        <RecapCard>
          <div className="py-10 text-center">
            <Camera size={40} className="mx-auto mb-3" style={{ color: "var(--fg-3)" }} aria-hidden />
            <p className="font-display text-lg font-bold">Aún no hay fotos</p>
            <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>Las fotos que tomen los invitados con la cámara de N&apos;GAGE aparecerán aquí.</p>
          </div>
        </RecapCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <header className="flex items-end justify-between gap-3 px-1 pt-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: "#34D399" }}>Desde los ojos de tus invitados</p>
          <h1 className="mt-1 font-display text-2xl font-bold">{plural(data.photos.length, "foto", "fotos")}</h1>
          <p className="text-sm" style={{ color: "var(--fg-3)" }}>{plural(photographers.length, "fotógrafo", "fotógrafos")}</p>
        </div>
      </header>

      <button
        type="button"
        onClick={downloadAll}
        disabled={zipState === "loading"}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl font-semibold text-white cursor-pointer transition-opacity disabled:opacity-70 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-pink)" }}
      >
        {zipState === "loading"
          ? <><Loader2 size={18} className="animate-spin" aria-hidden /> Preparando tu ZIP…</>
          : <><Download size={18} aria-hidden /> Descargar todas las fotos</>}
      </button>
      {zipError && <p role="alert" className="-mt-2 text-center text-sm" style={{ color: "#F87171" }}>{zipError}</p>}

      {photographers.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por quién tomó la foto">
          <FilterChip active={by === null} onClick={() => setBy(null)}>Todas</FilterChip>
          {photographers.map(([id, count]) => {
            const person = personById.get(id);
            return (
              <FilterChip key={id} active={by === id} onClick={() => setBy(id)}>
                <PersonAvatar person={person} size={24} />
                {person?.name} <span className="font-mono text-xs opacity-70">{count}</span>
              </FilterChip>
            );
          })}
        </div>
      )}

      <ul className="grid grid-cols-3 gap-1.5 md:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`Abrir foto ${i + 1}${p.byName ? ` de ${p.byName}` : ""}`}
              className="block aspect-square w-full overflow-hidden rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={recapImage.thumb(p.url)} alt="" loading="lazy" width={480} height={480} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>

      <PhotoLightbox photos={photos} index={openIndex} onIndexChange={setOpenIndex} />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex min-h-[40px] shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
      style={{ background: active ? "#FF2D78" : "rgba(255,255,255,0.05)", color: active ? "#fff" : "var(--fg-2)" }}
    >
      {children}
    </button>
  );
}
