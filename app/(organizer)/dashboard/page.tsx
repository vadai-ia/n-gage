"use client";

export const dynamic = "force-dynamic";

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

const TYPE_ICONS: Record<string, JSX.Element> = {
  wedding: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
  birthday: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8M12 7V3M8 7V5M16 7V5M4 21h16" /></svg>,
  corporate: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
  graduation: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M22 10l-10-5-10 5 10 5 10-5zM6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" /></svg>,
  concert: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  cruise: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M19 10l-1.5 8H6.5L5 10M12 4v6M3 10h18" /></svg>,
  other: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
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

  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, e) => sum + e._count.registrations, 0);
  const totalMatches = events.reduce((sum, e) => sum + e._count.matches, 0);
  const activeEvents = events.filter((e) => e.status === "active").length;

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
      <div className="p-4 pb-8">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="h-8 w-40 rounded-xl mb-4 skeleton" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl mb-3 skeleton" />
        ))}
      </div>
    );
  }

  const STATS = [
    { label: "Eventos", value: totalEvents, color: "#7B2FBE",
      icon: <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
    { label: "Activos", value: activeEvents, color: "#10B981",
      icon: <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
    { label: "Registros", value: totalRegistrations, color: "#1A6EFF",
      icon: <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
    { label: "Matches", value: totalMatches, color: "#FF2D78",
      icon: <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg> },
  ];

  return (
    <div className="p-4 pb-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ background: `${stat.color}0A`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <p className="text-2xl font-black tabular-nums" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs font-semibold" style={{ color: "#8585A8" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black tracking-tight" style={{ color: "#F0F0FF" }}>Mis Eventos</h1>
        <Link
          href="/events/new"
          className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(255,45,120,0.2)",
          }}
        >
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo
        </Link>
      </div>

      {/* Search & filter */}
      {events.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          <div className="relative">
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth={2}
              className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o ciudad..."
              className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all focus:ring-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#F0F0FF",
              }}
            />
          </div>
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
                className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
                style={{
                  background: filterStatus === f.value ? "rgba(255,45,120,0.12)" : "rgba(255,255,255,0.03)",
                  color: filterStatus === f.value ? "#FF2D78" : "#8585A8",
                  border: `1px solid ${filterStatus === f.value ? "rgba(255,45,120,0.3)" : "rgba(255,255,255,0.04)"}`,
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
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.08)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth={1.5}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: "#F0F0FF" }}>
            Aún no tienes eventos
          </h2>
          <p className="mb-6 text-sm" style={{ color: "#8585A8" }}>
            Crea tu primer evento y genera el QR para tus invitados
          </p>
          <Link
            href="/events/new"
            className="inline-block px-6 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(255,45,120,0.25)",
            }}
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
            const typeIcon = TYPE_ICONS[ev.type] ?? TYPE_ICONS.other;
            const date = new Date(ev.event_date).toLocaleDateString("es-MX", {
              day: "numeric", month: "short", year: "numeric",
            });
            return (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="flex flex-col gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${planInfo.color}0A`, color: planInfo.color }}
                    >
                      {typeIcon}
                    </div>
                    <div>
                      <h3 className="font-bold leading-tight" style={{ color: "#F0F0FF" }}>{ev.name}</h3>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: "#8585A8" }}>
                        {date}{ev.venue_city ? ` · ${ev.venue_city}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{ background: `${planInfo.color}15`, color: planInfo.color }}
                    >
                      {planInfo.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8585A8" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                    <span className="font-bold text-xs tabular-nums" style={{ color: "#F0F0FF" }}>{ev._count.registrations}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8585A8" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    <span className="font-bold text-xs tabular-nums" style={{ color: "#F0F0FF" }}>{ev._count.matches}</span>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[10px] font-mono" style={{ color: "#44445A" }}>
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
