"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatEventDate } from "@/lib/utils/date";

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
  const [reviews, setReviews] = useState<{ user: { full_name: string; email: string }; rating: number; comment: string | null; would_use_again: boolean; created_at: string }[]>([]);
  const [reviewStats, setReviewStats] = useState<{ total: number; average: number; wouldUseAgain: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/events/${eventId}`).then((r) => r.json()),
      fetch(`/api/v1/events/${eventId}/stats`).then((r) => r.json()),
      fetch(`/api/v1/events/${eventId}/reviews?mode=all`).then((r) => r.json()).catch(() => ({ reviews: [], stats: null })),
    ]).then(([evData, statsData, revData]) => {
      setEvent(evData.event);
      setStats(statsData.stats);
      setReviews(revData.reviews ?? []);
      setReviewStats(revData.stats ?? null);
      setLoading(false);
    });
  }, [eventId]);

  if (loading || !event) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex justify-center items-center" style={{ background: "#07070F" }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const eventDate = formatEventDate(event.event_date, {
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
    { label: "Registrados", value: stats?.registrations ?? 0, sub: stats?.capacity ? `de ${stats.capacity}` : null, color: "#1A6EFF", bgGlow: "rgba(26,110,255,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg> },
    { label: "Matches", value: stats?.matches ?? 0, sub: "conexiones", color: "#FF2D78", bgGlow: "rgba(255,45,120,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg> },
    { label: "Likes", value: stats?.likes ?? 0, sub: "interacciones", color: "#FFB800", bgGlow: "rgba(255,184,0,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M14 9V5a3 3 0 00-6 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" /></svg> },
    { label: "Cámara", value: stats?.photos ?? 0, sub: "fotos capturadas", color: "#7B2FBE", bgGlow: "rgba(123,47,190,0.08)",
      icon: <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg> },
  ];

  const searchRate = stats?.registrations
    ? Math.round(((stats.searches_started ?? 0) / stats.registrations) * 100)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: "#07070F" }}>
      <motion.div 
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2" style={{ color: "#F0F0FF" }}>
              Host Dashboard
            </h1>
            <p className="text-sm font-medium" style={{ color: "#8585A8" }}>
              Panel de control en vivo para el evento de hoy.
            </p>
          </div>
        </motion.div>

        {/* Event Info Card (Velvet Rope Style) */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-3xl p-6 lg:p-8 mb-8 overflow-hidden"
          style={{
            background: "rgba(15,15,26,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Subtle gradient orb behind event title */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none blur-[80px]" style={{ background: "rgba(255,45,120,0.15)" }} />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(123,47,190,0.15))", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.2)" }}
              >
                {typeIcon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black leading-tight tracking-tight mb-1" style={{ color: "#F0F0FF" }}>{event.name}</h2>
                <p className="text-sm font-medium" style={{ color: "#8585A8" }}>
                  {eventDate} {event.venue_city ? ` · ${event.venue_city}` : ""}
                </p>
              </div>
            </div>
            <div className="flex lg:flex-col items-center lg:items-end gap-2">
               <span
                  className="text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-widest"
                  style={{ background: `${statusInfo.color}15`, color: statusInfo.color, border: `1px solid ${statusInfo.color}30` }}
                >
                  {statusInfo.label}
                </span>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Metric Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="group rounded-3xl p-5 relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${m.bgGlow}, transparent 70%)` }} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}20` }}
                  >
                    {m.icon}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black tabular-nums tracking-tight mb-1" style={{ color: "#F0F0FF" }}>
                    {m.value.toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: m.color }}>{m.label}</div>
                  {m.sub && <div className="text-xs font-medium" style={{ color: "#44445A" }}>{m.sub}</div>}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Connection rate (Editorial Panel) */}
          {(stats?.registrations ?? 0) > 0 && (
            <motion.div
              variants={itemVariants}
              className="rounded-3xl p-6 lg:p-8 flex flex-col justify-center"
              style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex flex-col mb-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#44445A" }}>Tasa de Conexión</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight" style={{ color: "#F0F0FF" }}>{searchRate}%</span>
                  <span className="text-sm font-medium" style={{ color: "#8585A8" }}>participación activa</span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    background: "linear-gradient(90deg, #FF2D78, #7B2FBE)",
                    width: `${Math.min(100, searchRate)}%`,
                  }}
                />
              </div>
              <p className="text-xs font-medium" style={{ color: "#8585A8" }}>
                <strong style={{ color: "#F0F0FF" }}>{stats?.searches_started ?? 0}</strong> de <strong style={{ color: "#F0F0FF" }}>{stats?.registrations ?? 0}</strong> registrados iniciaron la búsqueda.
              </p>
            </motion.div>
          )}

          {/* Album status */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl p-6 lg:p-8 flex items-center"
            style={{
              background: isAlbumReady ? "rgba(16,185,129,0.05)" : "rgba(15,15,26,0.5)",
              border: `1px solid ${isAlbumReady ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)"}`,
            }}
          >
            <div className="flex items-start gap-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isAlbumReady ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                  color: isAlbumReady ? "#10B981" : "#44445A",
                  border: `1px solid ${isAlbumReady ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)"}`
                }}
              >
                {isAlbumReady ? (
                  <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-black text-lg tracking-tight mb-1" style={{ color: isAlbumReady ? "#10B981" : "#F0F0FF" }}>
                  {isAlbumReady ? "Cámara Revelada" : "Laboratorio en Proceso"}
                </p>
                <p className="text-sm font-medium leading-relaxed" style={{ color: "#8585A8" }}>
                  {isAlbumReady
                    ? "El álbum oficial del evento ya está generado. Dirígete a la pestaña 'Álbum' para revisar las capturas de tus invitados."
                    : `Las fotos desechables se están procesando y se revelarán oficialmente el ${albumDate}.`}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        {reviewStats && reviewStats.total > 0 && (
          <motion.div
            variants={itemVariants}
            className="rounded-3xl p-6 lg:p-8 mt-4"
            style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#44445A" }}>Resenas de invitados</p>
              <div className="flex items-center gap-1">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="#FFB800" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-black" style={{ color: "#FFB800" }}>{reviewStats.average}</span>
                <span className="text-xs" style={{ color: "#44445A" }}>({reviewStats.total})</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {reviews.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex gap-0.5 shrink-0 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} width={10} height={10} viewBox="0 0 24 24" fill={s <= r.rating ? "#FFB800" : "none"} stroke={s <= r.rating ? "#FFB800" : "#44445A"} strokeWidth={2}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: "#F0F0FF" }}>{r.user.full_name}</p>
                    {r.comment && <p className="text-xs mt-0.5" style={{ color: "#8585A8" }}>{r.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
