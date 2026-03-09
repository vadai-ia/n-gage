"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: string;
  name: string;
  type: string;
  event_date: string;
  status: string;
  unique_slug: string;
  venue_name: string | null;
  venue_city: string | null;
  plan: string;
  _count: { registrations: number; matches: number };
};

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  draft:   { bg: "rgba(133,133,168,0.15)", color: "#8585A8", label: "Borrador" },
  active:  { bg: "rgba(16,185,129,0.15)",  color: "#10B981", label: "Activo" },
  closed:  { bg: "rgba(239,68,68,0.15)",   color: "#EF4444", label: "Cerrado" },
  expired: { bg: "rgba(245,158,11,0.15)",  color: "#F59E0B", label: "Expirado" },
};

const TYPE_EMOJI: Record<string, string> = {
  wedding: "💍", birthday: "🎂", corporate: "💼",
  graduation: "🎓", concert: "🎵", cruise: "🚢", other: "🎉",
};

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  spark:     { label: "Spark",     color: "#8585A8" },
  connect:   { label: "Connect",   color: "#1A6EFF" },
  vibe:      { label: "Vibe",      color: "#FF2D78" },
  luxe:      { label: "Luxe",      color: "#FFB800" },
  elite:     { label: "Elite",     color: "#7B2FBE" },
  exclusive: { label: "Exclusive", color: "#FFB800" },
};

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetch("/api/v1/events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Summary stats
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, e) => sum + e._count.registrations, 0);
  const totalMatches = events.reduce((sum, e) => sum + e._count.matches, 0);
  const activeEvents = events.filter((e) => e.status === "active").length;

  // Filtering
  const filtered = events.filter((ev) => {
    const matchesSearch =
      search === "" ||
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      (ev.venue_city ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || ev.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-4">
        {/* Skeleton stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#0F0F1A" }} />
          ))}
        </div>
        <div className="h-8 w-40 rounded-xl mb-4 animate-pulse" style={{ background: "#0F0F1A" }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl mb-3 animate-pulse" style={{ background: "#0F0F1A" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 pb-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Eventos", value: totalEvents, icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B2FBE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ), color: "#7B2FBE" },
          { label: "Activos", value: activeEvents, icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ), color: "#10B981" },
          { label: "Registros", value: totalRegistrations, icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A6EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ), color: "#1A6EFF" },
          { label: "Matches", value: totalMatches, icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ), color: "#FF2D78" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              {stat.icon}
              <span className="text-xs font-medium" style={{ color: "#8585A8" }}>{stat.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#F0F0FF" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: "#F0F0FF" }}>Mis Eventos</h1>
        <Link
          href="/events/new"
          className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}
        >
          + Nuevo
        </Link>
      </div>

      {/* Search & filter */}
      {events.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o ciudad..."
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#F0F0FF",
            }}
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { value: "all", label: "Todos" },
              { value: "active", label: "Activos" },
              { value: "draft", label: "Borrador" },
              { value: "closed", label: "Cerrados" },
              { value: "expired", label: "Expirados" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: filterStatus === f.value ? "rgba(255,45,120,0.12)" : "rgba(255,255,255,0.04)",
                  color: filterStatus === f.value ? "#FF2D78" : "#8585A8",
                  border: `1px solid ${filterStatus === f.value ? "rgba(255,45,120,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Event list */}
      {events.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.08)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#F0F0FF" }}>
            Aun no tienes eventos
          </h2>
          <p className="mb-6 text-sm" style={{ color: "#8585A8" }}>
            Crea tu primer evento y genera el QR para tus invitados
          </p>
          <Link
            href="/events/new"
            className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}
          >
            Crear mi primer evento
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "#8585A8" }}>No se encontraron eventos con esos filtros</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((ev) => {
            const s = STATUS_COLORS[ev.status] ?? STATUS_COLORS.draft;
            const planInfo = PLAN_LABELS[ev.plan] ?? PLAN_LABELS.vibe;
            const date = new Date(ev.event_date).toLocaleDateString("es-MX", {
              day: "numeric", month: "short", year: "numeric",
            });
            return (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="flex flex-col gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TYPE_EMOJI[ev.type] ?? "🎉"}</span>
                    <div>
                      <h3 className="font-bold leading-tight" style={{ color: "#F0F0FF" }}>{ev.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "#8585A8" }}>
                        {date}{ev.venue_city ? ` · ${ev.venue_city}` : ""}
                        {ev.venue_name ? ` · ${ev.venue_name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${planInfo.color}15`, color: planInfo.color }}
                    >
                      {planInfo.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8585A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                    <span className="font-bold text-sm" style={{ color: "#F0F0FF" }}>{ev._count.registrations}</span>
                    <span className="text-xs" style={{ color: "#8585A8" }}>registros</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8585A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="font-bold text-sm" style={{ color: "#F0F0FF" }}>{ev._count.matches}</span>
                    <span className="text-xs" style={{ color: "#8585A8" }}>matches</span>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs font-mono" style={{ color: "#44445A" }}>
                      /e/{ev.unique_slug.length > 20 ? ev.unique_slug.slice(0, 20) + "..." : ev.unique_slug}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
