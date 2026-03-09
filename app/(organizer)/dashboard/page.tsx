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
  venue_city: string | null;
  _count: { registrations: number; matches: number };
};

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  draft:   { bg: "rgba(160,160,176,0.15)", color: "#A0A0B0", label: "Borrador" },
  active:  { bg: "rgba(255,60,172,0.15)",  color: "#FF3CAC", label: "Activo" },
  closed:  { bg: "rgba(43,134,197,0.15)",  color: "#2B86C5", label: "Cerrado" },
  expired: { bg: "rgba(100,100,100,0.15)", color: "#666",    label: "Expirado" },
};

const TYPE_EMOJI: Record<string, string> = {
  wedding: "💍", birthday: "🎂", corporate: "💼",
  graduation: "🎓", concert: "🎵", cruise: "🚢", other: "🎉",
};

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/events")
      .then((r) => r.json())
      .then((d) => { setEvents(d.events || []); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-8 w-40 rounded-xl mb-6 animate-pulse" style={{ background: "#16161F" }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl mb-3 animate-pulse" style={{ background: "#16161F" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis Eventos</h1>
        <Link href="/events/new"
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
          + Nuevo
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">Aún no tienes eventos</h2>
          <p className="mb-6" style={{ color: "#A0A0B0" }}>Crea tu primer evento y genera el QR</p>
          <Link href="/events/new"
            className="px-6 py-3 rounded-xl font-bold"
            style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
            Crear evento
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((ev) => {
            const s = STATUS_COLORS[ev.status] ?? STATUS_COLORS.draft;
            const date = new Date(ev.event_date).toLocaleDateString("es-MX", {
              day: "numeric", month: "short", year: "numeric",
            });
            return (
              <Link key={ev.id} href={`/events/${ev.id}`}
                className="flex flex-col gap-3 p-4 rounded-2xl transition-all"
                style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{TYPE_EMOJI[ev.type] ?? "🎉"}</span>
                    <div>
                      <h3 className="font-bold leading-tight">{ev.name}</h3>
                      <p className="text-xs" style={{ color: "#A0A0B0" }}>
                        {date}{ev.venue_city ? ` · ${ev.venue_city}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
                <div className="flex gap-4">
                  {[
                    { icon: "👥", val: ev._count.registrations, label: "registros" },
                    { icon: "💑", val: ev._count.matches, label: "matches" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-1">
                      <span>{stat.icon}</span>
                      <span className="font-bold text-sm">{stat.val}</span>
                      <span className="text-xs" style={{ color: "#A0A0B0" }}>{stat.label}</span>
                    </div>
                  ))}
                  <div className="ml-auto">
                    <span className="text-xs" style={{ color: "#A0A0B0" }}>
                      /e/{ev.unique_slug.slice(0, 20)}...
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
