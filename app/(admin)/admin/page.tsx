"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  venue_city: string | null;
  organizer: { full_name: string };
  _count: { registrations: number; matches: number };
};

type Organizer = {
  id: string;
  full_name: string;
  email: string;
  _count: { organized_events: number };
};

const STATUS_COLOR: Record<string, string> = {
  draft: "#8585A8",
  active: "#10B981",
  closed: "#EF4444",
  expired: "#F59E0B",
};

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-4 animate-pulse"
      style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="h-3 w-12 rounded mb-3" style={{ background: "#1a1a2e" }} />
      <div className="h-7 w-16 rounded mb-2" style={{ background: "#1a1a2e" }} />
      <div className="h-3 w-24 rounded" style={{ background: "#1a1a2e" }} />
    </div>
  );
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentEvent[]>([]);
  const [orgs, setOrgs] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setRecent(d.recentEvents ?? []);
        setOrgs(d.topOrganizers ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="h-8 w-48 rounded mb-2 animate-pulse" style={{ background: "#1a1a2e" }} />
        <div className="h-4 w-64 rounded mb-6 animate-pulse" style={{ background: "#1a1a2e" }} />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const METRICS = [
    {
      label: "Eventos totales",
      value: stats.totalEvents,
      sub: `${stats.activeEvents} activos`,
      color: "#FFB800",
      icon: (
        <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      label: "Usuarios",
      value: stats.totalUsers,
      sub: "registrados",
      color: "#1A6EFF",
      icon: (
        <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label: "Registros",
      value: stats.totalRegistrations,
      sub: "invitados en eventos",
      color: "#10B981",
      icon: (
        <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 11h-6M19 8v6" />
        </svg>
      ),
    },
    {
      label: "Matches",
      value: stats.totalMatches,
      sub: "conexiones logradas",
      color: "#FF2D78",
      icon: (
        <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      ),
    },
    {
      label: "Fotos",
      value: stats.totalPhotos,
      sub: "tomadas en la plataforma",
      color: "#7B2FBE",
      icon: (
        <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      ),
    },
    {
      label: "Reportes",
      value: stats.pendingReports,
      sub: `${stats.totalReports} totales`,
      color: "#EF4444",
      icon: (
        <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: "#F0F0FF" }}>
          Panel de Control
        </h1>
        <p className="text-sm" style={{ color: "#8585A8" }}>
          Vista general de N&apos;GAGE
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/events/new"
          className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-opacity hover:opacity-80"
          style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}
        >
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Crear Evento
        </Link>
        <Link
          href="/admin/users"
          className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          style={{ background: "rgba(26,110,255,0.15)", color: "#1A6EFF" }}
        >
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          Ver Usuarios
        </Link>
        <Link
          href="/admin/reports"
          className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
        >
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
          </svg>
          Ver Reportes
          {stats.pendingReports > 0 && (
            <span
              className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: "#EF4444", color: "#fff" }}
            >
              {stats.pendingReports}
            </span>
          )}
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl p-4 transition-transform hover:scale-[1.02]"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${m.color}15`, color: m.color }}
            >
              {m.icon}
            </div>
            <div className="text-2xl lg:text-3xl font-black" style={{ color: m.color }}>
              {m.value.toLocaleString()}
            </div>
            <div className="text-xs font-semibold mt-1" style={{ color: "#F0F0FF" }}>
              {m.label}
            </div>
            <div className="text-xs" style={{ color: "#44445A" }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns on desktop */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#8585A8" }}
            >
              Ultimos eventos
            </h2>
            <Link
              href="/admin/events"
              className="text-xs font-semibold"
              style={{ color: "#FF2D78" }}
            >
              Ver todos
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recent.map((ev) => (
              <Link
                key={ev.id}
                href={`/admin/events/${ev.id}`}
                className="rounded-xl p-3 flex items-center justify-between transition-colors hover:brightness-110"
                style={{
                  background: "#0F0F1A",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate" style={{ color: "#F0F0FF" }}>
                    {ev.name}
                  </p>
                  <p className="text-xs" style={{ color: "#8585A8" }}>
                    {ev.organizer.full_name}
                  </p>
                  <p className="text-xs" style={{ color: "#44445A" }}>
                    {new Date(ev.event_date).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                    style={{
                      background: `${STATUS_COLOR[ev.status] ?? "#555"}22`,
                      color: STATUS_COLOR[ev.status] ?? "#555",
                    }}
                  >
                    {ev.status}
                  </span>
                  <p className="text-xs mt-1" style={{ color: "#44445A" }}>
                    {ev._count.registrations} reg / {ev._count.matches} matches
                  </p>
                </div>
              </Link>
            ))}
            {recent.length === 0 && (
              <p className="text-sm py-8 text-center" style={{ color: "#44445A" }}>
                No hay eventos aun
              </p>
            )}
          </div>
        </div>

        {/* Top Organizers */}
        <div>
          <h2
            className="text-xs font-bold mb-3 uppercase tracking-wider"
            style={{ color: "#8585A8" }}
          >
            Top organizadores
          </h2>
          <div className="flex flex-col gap-2">
            {orgs.map((org, i) => (
              <div
                key={org.id}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{
                  background: "#0F0F1A",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  className="text-sm font-black w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: i === 0 ? "rgba(255,184,0,0.15)" : "rgba(255,255,255,0.05)",
                    color: i === 0 ? "#FFB800" : "#44445A",
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "#F0F0FF" }}>
                    {org.full_name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#8585A8" }}>
                    {org.email}
                  </p>
                </div>
                <span className="text-sm font-bold flex-shrink-0" style={{ color: "#FFB800" }}>
                  {org._count.organized_events}
                </span>
              </div>
            ))}
            {orgs.length === 0 && (
              <p className="text-sm py-8 text-center" style={{ color: "#44445A" }}>
                No hay organizadores aun
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
