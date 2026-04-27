"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatEventDate } from "@/lib/utils/date";

type EventBrief = { id: string; name: string; event_date: string | null; type: string };

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  would_use_again: boolean;
  created_at: string;
  event: EventBrief;
  user: { id: string; full_name: string; email: string; avatar_url: string | null };
};

type Summary = {
  total: number;
  avg_rating: number;
  would_use_again_count: number;
  would_use_again_pct: number;
  events_reviewed: number;
  distribution: number[];
};

type ByEvent = {
  event_id: string;
  event_name: string;
  event_date: string | null;
  event_type: string;
  count: number;
  avg_rating: number;
  would_use_again_pct: number;
};

type AdminReviewsResponse = {
  summary: Summary;
  by_event: ByEvent[];
  latest: Review[];
  top: Review[];
  bottom: Review[];
};

type Tab = "latest" | "top" | "bottom";

const TAB_LABEL: Record<Tab, string> = {
  latest: "Ultimas reseñas",
  top: "Mejores reseñas",
  bottom: "Peores reseñas",
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= rating ? "#FFB800" : "none"}
          stroke={s <= rating ? "#FFB800" : "rgba(255,255,255,0.18)"}
          strokeWidth={1.5}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function StatCard({ label, value, sub, color = "#F0F0FF" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#FF8C5A" }}>
        {label}
      </p>
      <p className="text-3xl font-black tracking-tight" style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] mt-1.5" style={{ color: "#8585A8" }}>{sub}</p>}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [data, setData] = useState<AdminReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("latest");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`/api/v1/admin/reviews`)
      .then((r) => r.json())
      .then((d: AdminReviewsResponse | { error: string }) => {
        if ("error" in d) return;
        setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const reviews = useMemo<Review[]>(() => {
    if (!data) return [];
    const base = data[tab];
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((r) =>
      r.user.full_name.toLowerCase().includes(q) ||
      (r.user.email ?? "").toLowerCase().includes(q) ||
      (r.comment ?? "").toLowerCase().includes(q) ||
      r.event.name.toLowerCase().includes(q)
    );
  }, [data, tab, query]);

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="h-8 w-56 rounded-lg mb-2 skeleton" />
        <div className="h-4 w-72 rounded-lg mb-6 skeleton" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-2xl skeleton" />)}
        </div>
        <div className="h-64 rounded-2xl skeleton" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <p className="text-sm" style={{ color: "#8585A8" }}>No fue posible cargar las calificaciones.</p>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-1" style={{ color: "#F0F0FF" }}>
        Calificaciones
      </h1>
      <p className="text-sm mb-6" style={{ color: "#8585A8" }}>
        Feedback de invitados sobre N&apos;GAGE y los eventos.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total de reseñas" value={s.total} sub="reseñas recibidas" color="#F0F0FF" />
        <StatCard label="Promedio general" value={`${s.avg_rating} / 5`} sub="experiencia con la plataforma" color="#FF2D78" />
        <StatCard label="Volveria a usar" value={`${s.would_use_again_pct}%`} sub={`${s.would_use_again_count} de ${s.total} dijeron que si`} color="#10B981" />
        <StatCard label="Eventos evaluados" value={s.events_reviewed} sub="con al menos 1 reseña" color="#7B2FBE" />
      </div>

      {/* Distribution + by event */}
      <div className="grid lg:grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#8585A8" }}>
            Distribucion de estrellas
          </p>
          <div className="flex flex-col gap-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = s.distribution[star - 1] ?? 0;
              const max = Math.max(1, ...s.distribution);
              const pct = (count / max) * 100;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-12 shrink-0" style={{ color: "#FFB800" }}>
                    {star} ★
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #FFB800, #FF8C5A)",
                        boxShadow: "0 0 10px rgba(255,184,0,0.35)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8 text-right shrink-0" style={{ color: "#F0F0FF" }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#8585A8" }}>
            Desglose por evento
          </p>
          {data.by_event.length === 0 ? (
            <p className="text-xs" style={{ color: "#44445A" }}>No hay reseñas todavia.</p>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {data.by_event.map((e) => (
                <Link
                  key={e.event_id}
                  href={`/admin/events/${e.event_id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#F0F0FF" }}>
                      {e.event_name}
                    </p>
                    <p className="text-[10px]" style={{ color: "#44445A" }}>
                      {formatEventDate(e.event_date, { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-medium" style={{ color: "#8585A8" }}>{e.count} reseñas</span>
                    <span className="text-xs font-black" style={{ color: "#FFB800" }}>{e.avg_rating}</span>
                    <StarRow rating={Math.round(e.avg_rating)} size={11} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: active ? "rgba(255,45,120,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.06)"}`,
                color: active ? "#FF2D78" : "#8585A8",
              }}
            >
              {TAB_LABEL[t]}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#44445A"
          strokeWidth={2}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por invitado, evento o comentario..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#F0F0FF",
          }}
        />
      </div>

      {/* Reviews list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        {/* Header row */}
        <div className="hidden md:grid px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: "#44445A", borderBottom: "1px solid rgba(255,255,255,0.04)", gridTemplateColumns: "1.4fr 1.2fr 1fr 2fr 0.6fr" }}>
          <span>Invitado</span>
          <span>Evento</span>
          <span>Estrellas</span>
          <span>Comentario</span>
          <span className="text-right">Fecha</span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm" style={{ color: "#44445A" }}>
              {query ? "Sin resultados para tu busqueda." : "No hay reseñas en esta lista."}
            </p>
          </div>
        ) : (
          reviews.map((r) => {
            const firstName = r.user.full_name.split(" ")[0] ?? r.user.full_name;
            return (
              <div
                key={r.id}
                className="flex flex-col md:grid gap-2 md:gap-3 px-4 py-4 md:items-start"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.03)",
                  gridTemplateColumns: "1.4fr 1.2fr 1fr 2fr 0.6fr",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold overflow-hidden shrink-0"
                    style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
                  >
                    {r.user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      firstName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#F0F0FF" }}>
                      {r.user.full_name}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: "#44445A" }}>
                      {r.user.email}
                    </p>
                  </div>
                </div>

                <Link href={`/admin/events/${r.event.id}`} className="min-w-0">
                  <p className="text-sm font-medium truncate hover:underline" style={{ color: "#F0F0FF" }}>
                    {r.event.name}
                  </p>
                  <p className="text-[10px]" style={{ color: "#44445A" }}>
                    {formatEventDate(r.event.event_date, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </Link>

                <div className="flex items-center gap-2">
                  <StarRow rating={r.rating} />
                  <span className="text-xs font-bold" style={{ color: "#FFB800" }}>{r.rating}</span>
                  {r.would_use_again ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
                      Volveria
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>
                      No volveria
                    </span>
                  )}
                </div>

                <p className="text-sm" style={{ color: r.comment ? "#F0F0FF" : "#44445A" }}>
                  {r.comment ?? "Sin comentario"}
                </p>

                <span className="text-xs md:text-right shrink-0" style={{ color: "#44445A" }}>
                  {new Date(r.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
