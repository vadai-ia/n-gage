"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatEventDate } from "@/lib/utils/date";

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
  closed: "#FF2D78",
  expired: "#FFB800",
};

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
      <div className="min-h-screen p-4 lg:p-8 flex justify-center items-center" style={{ background: "#07070F" }}>
         <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#1A6EFF", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const METRICS = [
    { label: "Eventos", value: stats.totalEvents, sub: `${stats.activeEvents} activos`, color: "#FFB800", bgGlow: "rgba(255,184,0,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
    { label: "Usuarios", value: stats.totalUsers, sub: "registrados", color: "#1A6EFF", bgGlow: "rgba(26,110,255,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
    { label: "Registros", value: stats.totalRegistrations, sub: "en eventos", color: "#10B981", bgGlow: "rgba(16,185,129,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 11h-6M19 8v6" /></svg> },
    { label: "Matches", value: stats.totalMatches, sub: "conexiones", color: "#FF2D78", bgGlow: "rgba(255,45,120,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg> },
    { label: "Fotos", value: stats.totalPhotos, sub: "capturadas", color: "#7B2FBE", bgGlow: "rgba(123,47,190,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg> },
    { label: "Reportes", value: stats.pendingReports, sub: `${stats.totalReports} totales`, color: "#EF4444", bgGlow: "rgba(239,68,68,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" /></svg> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: "#07070F" }}>
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2" style={{ color: "#F0F0FF" }}>
            Super Admin
          </h1>
          <p className="text-sm font-medium" style={{ color: "#8585A8" }}>
            Métricas globales y gestión de la plataforma N&apos;GAGE
          </p>
        </motion.div>

        {/* Quick Actions (Premium Buttons) */}
        <motion.div variants={itemVariants} className="flex gap-3 mb-10 flex-wrap">
          <Link
            href="/events/new"
            className="px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff",
              boxShadow: "0 8px 24px rgba(255,45,120,0.25)" }}
          >
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Crear Evento
          </Link>
          <Link href="/admin/users"
            className="px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all hover:bg-white/5 active:scale-95"
            style={{ background: "rgba(26,110,255,0.08)", color: "#1A6EFF", border: "1px solid rgba(26,110,255,0.15)" }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
            Usuarios
          </Link>
          {stats.pendingReports > 0 && (
            <Link href="/admin/reports"
              className="relative px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all hover:bg-red-500/10 active:scale-95"
              style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}>
              <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
              </svg>
              Reportes
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center animate-pulse"
                style={{ background: "#EF4444", color: "#fff", boxShadow: "0 4px 12px rgba(239,68,68,0.4)" }}>{stats.pendingReports}</span>
            </Link>
          )}
        </motion.div>

        {/* Metric Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="group rounded-3xl p-5 relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              style={{
                background: "rgba(15,15,26,0.5)",
                border: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)"
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${m.bgGlow}, transparent 70%)` }} />
              
              <div className="relative z-10">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}20` }}
                >
                  {m.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-black tabular-nums tracking-tight mb-1" style={{ color: "#F0F0FF" }}>
                  {m.value.toLocaleString()}
                </div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: m.color }}>{m.label}</div>
                <div className="text-xs font-medium" style={{ color: "#44445A" }}>{m.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Two columns layout for deeper insights */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8585A8" }}>
                Últimos eventos
              </h2>
              <Link href="/admin/events" className="text-xs font-bold hover:underline" style={{ color: "#FF2D78" }}>
                Ver todos
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recent.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/admin/events/${ev.id}`}
                  className="rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base truncate mb-1.5" style={{ color: "#F0F0FF" }}>{ev.name}</p>
                    <p className="text-xs font-medium truncate mb-0.5" style={{ color: "#8585A8" }}>Host: {ev.organizer.full_name}</p>
                    <p className="text-[11px] font-medium" style={{ color: "#44445A" }}>
                      {formatEventDate(ev.event_date, { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0 flex flex-col items-end">
                    <span
                      className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest mb-2"
                      style={{
                        background: `${STATUS_COLOR[ev.status] ?? "#555"}15`,
                        color: STATUS_COLOR[ev.status] ?? "#555",
                        border: `1px solid ${STATUS_COLOR[ev.status] ?? "#555"}30`
                      }}
                    >
                      {ev.status}
                    </span>
                    <p className="text-[11px] font-semibold" style={{ color: "#8585A8" }}>
                      <strong style={{ color: "#F0F0FF" }}>{ev._count.registrations}</strong> reg • <strong style={{ color: "#F0F0FF" }}>{ev._count.matches}</strong> match
                    </p>
                  </div>
                </Link>
              ))}
              {recent.length === 0 && (
                <div className="rounded-3xl p-10 text-center" style={{ background: "rgba(15,15,26,0.3)", border: "1px dashed rgba(255,255,255,0.05)" }}>
                   <p className="text-sm font-medium" style={{ color: "#44445A" }}>No hay eventos registrados aún</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Organizers */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8585A8" }}>
                Top organizadores
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {orgs.map((org, i) => (
                <div
                  key={org.id}
                  className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg text-lg font-black"
                    style={{
                      background: i === 0 ? "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,45,120,0.1))" : "rgba(255,255,255,0.03)",
                      color: i === 0 ? "#FFB800" : "#8585A8",
                      border: i === 0 ? "1px solid rgba(255,184,0,0.3)" : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate mb-1" style={{ color: "#F0F0FF" }}>{org.full_name}</p>
                    <p className="text-xs truncate font-medium" style={{ color: "#44445A" }}>{org.email}</p>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-2xl font-black leading-none" style={{ color: i === 0 ? "#FFB800" : "#F0F0FF" }}>
                       {org._count.organized_events}
                     </span>
                     <span className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "#44445A"}}>Eventos</span>
                  </div>
                </div>
              ))}
              {orgs.length === 0 && (
                <div className="rounded-3xl p-10 text-center" style={{ background: "rgba(15,15,26,0.3)", border: "1px dashed rgba(255,255,255,0.05)" }}>
                   <p className="text-sm font-medium" style={{ color: "#44445A" }}>No hay organizadores aún</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
