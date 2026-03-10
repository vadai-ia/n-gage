"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type EventData = {
  id: string;
  name: string;
  type: string;
  event_date: string;
  venue_name: string | null;
  venue_city: string | null;
  status: string;
  album_release_at: string | null;
  expiry_at: string | null;
  plan: string;
};

type Stats = {
  registrations: number;
  searches_started: number;
  likes: number;
  matches: number;
  photos: number;
  capacity: number | null;
};

const TYPE_ICONS: Record<string, JSX.Element> = {
  wedding: <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
  birthday: <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8M12 7V3M8 7V5M16 7V5M4 21h16" /><rect x="2" y="21" width="20" height="0" /></svg>,
  corporate: <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
  default: <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
};

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "#8585A8" },
  active: { label: "Activo", color: "#10B981" },
  closed: { label: "Cerrado", color: "#EF4444" },
  expired: { label: "Expirado", color: "#F59E0B" },
};

export default function HostHomePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/events/${eventId}`).then((r) => r.json()),
      fetch(`/api/v1/events/${eventId}/stats`).then((r) => r.json()),
    ]).then(([evData, statsData]) => {
      setEvent(evData.event);
      setStats(statsData.stats);
      setLoading(false);
    });
  }, [eventId]);

  if (loading || !event) {
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto">
        <div className="h-32 rounded-2xl mb-4 skeleton" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="h-24 rounded-2xl skeleton" />
      </div>
    );
  }

  const eventDate = new Date(event.event_date).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const albumDate = event.album_release_at
    ? new Date(event.album_release_at).toLocaleDateString("es-MX", { day: "numeric", month: "long" })
    : "al día siguiente";

  const isAlbumReady = event.album_release_at
    ? new Date(event.album_release_at) < new Date()
    : false;

  const statusInfo = STATUS_INFO[event.status] ?? STATUS_INFO.draft;
  const typeIcon = TYPE_ICONS[event.type] ?? TYPE_ICONS.default;

  const METRICS = [
    { label: "Registrados", value: stats?.registrations ?? 0, sub: stats?.capacity ? `de ${stats.capacity}` : null, color: "#1A6EFF",
      icon: <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg> },
    { label: "Matches", value: stats?.matches ?? 0, sub: null, color: "#FF2D78",
      icon: <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg> },
    { label: "Likes", value: stats?.likes ?? 0, sub: null, color: "#FFB800",
      icon: <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M14 9V5a3 3 0 00-6 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" /></svg> },
    { label: "Fotos", value: stats?.photos ?? 0, sub: `de ${(stats?.registrations ?? 0) * 10} posibles`, color: "#7B2FBE",
      icon: <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg> },
  ];

  const searchRate = stats?.registrations
    ? Math.round(((stats.searches_started ?? 0) / stats.registrations) * 100)
    : 0;

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      {/* Event header card */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(123,47,190,0.12), rgba(255,45,120,0.06))",
          border: "1px solid rgba(123,47,190,0.15)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(123,47,190,0.12)", color: "#7B2FBE" }}
          >
            {typeIcon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black leading-tight tracking-tight" style={{ color: "#F0F0FF" }}>{event.name}</h1>
            <p className="text-xs font-medium mt-1" style={{ color: "#8585A8" }}>
              {eventDate}
              {event.venue_city ? ` · ${event.venue_city}` : ""}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ background: `${statusInfo.color}15`, color: statusInfo.color, border: `1px solid ${statusInfo.color}25` }}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl p-4 transition-all"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${m.color}0A`, color: m.color }}
            >
              {m.icon}
            </div>
            <div className="text-2xl font-black tabular-nums" style={{ color: m.color }}>
              {m.value.toLocaleString()}
            </div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: "#F0F0FF" }}>{m.label}</div>
            {m.sub && <div className="text-[10px] font-medium" style={{ color: "#44445A" }}>{m.sub}</div>}
          </div>
        ))}
      </div>

      {/* Connection rate */}
      {(stats?.registrations ?? 0) > 0 && (
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8585A8" }}>Tasa de conexión</p>
            <span className="text-sm font-black" style={{ color: "#FF2D78" }}>{searchRate}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                background: "linear-gradient(90deg, #FF2D78, #7B2FBE)",
                width: `${Math.min(100, searchRate)}%`,
              }}
            />
          </div>
          <p className="text-[10px] font-medium mt-2" style={{ color: "#44445A" }}>
            {stats?.searches_started ?? 0} de {stats?.registrations ?? 0} iniciaron búsqueda
          </p>
        </div>
      )}

      {/* Album status */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: isAlbumReady ? "rgba(16,185,129,0.06)" : "rgba(255,45,120,0.04)",
          border: `1px solid ${isAlbumReady ? "rgba(16,185,129,0.15)" : "rgba(255,45,120,0.1)"}`,
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: isAlbumReady ? "rgba(16,185,129,0.1)" : "rgba(255,45,120,0.08)",
              color: isAlbumReady ? "#10B981" : "#FF2D78",
            }}
          >
            {isAlbumReady ? (
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: isAlbumReady ? "#10B981" : "#FF2D78" }}>
              {isAlbumReady ? "Álbum disponible" : "Álbum en preparación"}
            </p>
            <p className="text-xs font-medium" style={{ color: "#8585A8" }}>
              {isAlbumReady
                ? "Ve a la pestaña Álbum para ver y descargar todas las fotos."
                : `Las fotos estarán disponibles el ${albumDate}.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
