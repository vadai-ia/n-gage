"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalEvents: number;
  activeEvents: number;
  totalUsers: number;
  totalRegistrations: number;
  totalMatches: number;
  totalPhotos: number;
  totalReports: number;
  pendingReports: number;
};

type RecentEvent = {
  id: string;
  name: string;
  status: string;
  plan: string;
  event_date: string;
  organizer: { full_name: string };
  _count: { registrations: number; matches: number };
};

type Organizer = {
  id: string;
  full_name: string;
  email: string;
  _count: { organized_events: number };
};

export default function AdminHomePage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentEvent[]>([]);
  const [orgs, setOrgs]     = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setRecent(d.recentEvents ?? []);
        setOrgs(d.topOrganizers ?? []);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-20 rounded-2xl mb-3 animate-pulse" style={{ background: "#16161F" }} />
        ))}
      </div>
    );
  }

  const METRICS = [
    { icon: "🎉", label: "Eventos totales",   value: stats.totalEvents,        sub: `${stats.activeEvents} activos`, color: "#F59E0B" },
    { icon: "👥", label: "Usuarios",           value: stats.totalUsers,         sub: "registrados", color: "#2B86C5" },
    { icon: "💑", label: "Matches generados",  value: stats.totalMatches,       sub: "en todos los eventos", color: "#FF3CAC" },
    { icon: "📸", label: "Fotos tomadas",      value: stats.totalPhotos,        sub: "en la plataforma", color: "#784BA0" },
    { icon: "🎟️", label: "Registros totales", value: stats.totalRegistrations, sub: "invitados en eventos", color: "#10B981" },
    { icon: "🚨", label: "Reportes pendientes",value: stats.pendingReports,     sub: `de ${stats.totalReports} totales`, color: "#EF4444" },
  ];

  const STATUS_COLOR: Record<string, string> = {
    draft: "#A0A0B0", active: "#10B981", closed: "#EF4444", archived: "#555",
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Panel de Control</h1>
      <p className="text-sm mb-5" style={{ color: "#A0A0B0" }}>Vista general de N&apos;GAGE</p>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-2xl p-4"
            style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-2xl mb-1">{m.icon}</div>
            <div className="text-2xl font-black" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs font-semibold" style={{ color: "#ccc" }}>{m.label}</div>
            <div className="text-xs" style={{ color: "#555" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Eventos recientes */}
      <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: "#A0A0B0" }}>
        Últimos eventos
      </h2>
      <div className="flex flex-col gap-2 mb-6">
        {recent.map((ev) => (
          <div key={ev.id} className="rounded-xl p-3 flex items-center justify-between"
            style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{ev.name}</p>
              <p className="text-xs" style={{ color: "#A0A0B0" }}>{ev.organizer.full_name}</p>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                style={{ background: `${STATUS_COLOR[ev.status]}22`, color: STATUS_COLOR[ev.status] }}>
                {ev.status}
              </span>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                {ev._count.registrations} reg · {ev._count.matches} matches
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Top organizadores */}
      <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: "#A0A0B0" }}>
        Top organizadores
      </h2>
      <div className="flex flex-col gap-2">
        {orgs.map((org, i) => (
          <div key={org.id} className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-sm font-black w-6 text-center" style={{ color: "#555" }}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{org.full_name}</p>
              <p className="text-xs truncate" style={{ color: "#A0A0B0" }}>{org.email}</p>
            </div>
            <span className="text-sm font-bold" style={{ color: "#F59E0B" }}>
              {org._count.organized_events} eventos
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
