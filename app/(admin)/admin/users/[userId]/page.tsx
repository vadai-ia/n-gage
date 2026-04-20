"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type UserDetail = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  registrations: Array<{
    id: string;
    event: { id: string; name: string; event_date: string; status: string; type: string; venue_city: string | null };
  }>;
  organized_events: Array<{
    id: string;
    name: string;
    event_date: string;
    status: string;
    _count: { registrations: number; matches: number };
  }>;
  app_reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    would_use_again: boolean;
    created_at: string;
    event: { name: string };
  }>;
};

type Stats = {
  events_attended: number;
  events_organized: number;
  total_likes_received: number;
  total_likes_sent: number;
  total_matches: number;
  total_photos: number;
  total_reviews: number;
};

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/admin/users/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setStats(d.stats);
        setLoading(false);
      });
  }, [userId]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070F" }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="text-sm mb-4 flex items-center gap-1" style={{ color: "#8585A8" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Volver a usuarios
      </button>

      {/* Header */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0"
            style={{ border: "2px solid rgba(255,45,120,0.3)" }}>
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black"
                style={{ background: "rgba(255,45,120,0.1)", color: "#FF2D78" }}>
                {user.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black mb-1" style={{ color: "#F0F0FF" }}>{user.full_name}</h1>
            <p className="text-sm mb-2" style={{ color: "#8585A8" }}>{user.email}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                style={{
                  background: user.role === "SUPER_ADMIN" ? "rgba(255,45,120,0.15)"
                    : user.role === "EVENT_ORGANIZER" ? "rgba(123,47,190,0.15)"
                    : user.role === "EVENT_HOST" ? "rgba(26,110,255,0.15)"
                    : "rgba(255,255,255,0.05)",
                  color: user.role === "SUPER_ADMIN" ? "#FF2D78"
                    : user.role === "EVENT_ORGANIZER" ? "#7B2FBE"
                    : user.role === "EVENT_HOST" ? "#1A6EFF"
                    : "#8585A8",
                }}>
                {user.role}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                style={{
                  background: user.is_active ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: user.is_active ? "#10B981" : "#EF4444",
                }}>
                {user.is_active ? "Activo" : "Inactivo"}
              </span>
              <span className="text-[10px]" style={{ color: "#44445A" }}>
                Desde {new Date(user.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {[
            { label: "Eventos", value: stats.events_attended, color: "#1A6EFF", bg: "rgba(26,110,255,0.08)" },
            { label: "Organizados", value: stats.events_organized, color: "#7B2FBE", bg: "rgba(123,47,190,0.08)" },
            { label: "Likes recibidos", value: stats.total_likes_received, color: "#FF2D78", bg: "rgba(255,45,120,0.08)" },
            { label: "Likes dados", value: stats.total_likes_sent, color: "#FF6BA8", bg: "rgba(255,107,168,0.08)" },
            { label: "Matches", value: stats.total_matches, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
            { label: "Resenas", value: stats.total_reviews, color: "#FFB800", bg: "rgba(255,184,0,0.08)" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "#8585A8" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Events attended */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
        <h2 className="text-sm font-black mb-3" style={{ color: "#F0F0FF" }}>
          Eventos a los que asistio ({user.registrations.length})
        </h2>
        {user.registrations.length === 0 ? (
          <p className="text-xs" style={{ color: "#44445A" }}>No ha asistido a ningun evento</p>
        ) : (
          <div className="flex flex-col gap-2">
            {user.registrations.map((r) => (
              <Link key={r.id} href={`/admin/events/${r.event.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#F0F0FF" }}>{r.event.name}</p>
                  <p className="text-[10px]" style={{ color: "#8585A8" }}>
                    {new Date(r.event.event_date).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    {r.event.venue_city && ` · ${r.event.venue_city}`}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0"
                  style={{
                    background: r.event.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                    color: r.event.status === "active" ? "#10B981" : "#8585A8",
                  }}>
                  {r.event.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Events organized */}
      {user.organized_events.length > 0 && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
          <h2 className="text-sm font-black mb-3" style={{ color: "#F0F0FF" }}>
            Eventos organizados ({user.organized_events.length})
          </h2>
          <div className="flex flex-col gap-2">
            {user.organized_events.map((e) => (
              <Link key={e.id} href={`/admin/events/${e.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#F0F0FF" }}>{e.name}</p>
                  <p className="text-[10px]" style={{ color: "#8585A8" }}>
                    {e._count.registrations} registros · {e._count.matches} matches
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0"
                  style={{
                    background: e.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                    color: e.status === "active" ? "#10B981" : "#8585A8",
                  }}>
                  {e.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {user.app_reviews.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
          <h2 className="text-sm font-black mb-3" style={{ color: "#F0F0FF" }}>
            Resenas dejadas ({user.app_reviews.length})
          </h2>
          <div className="flex flex-col gap-2">
            {user.app_reviews.map((r) => (
              <div key={r.id} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold" style={{ color: "#F0F0FF" }}>{r.event.name}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} width={10} height={10} viewBox="0 0 24 24" fill={s <= r.rating ? "#FFB800" : "none"}
                        stroke={s <= r.rating ? "#FFB800" : "#44445A"} strokeWidth={2}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-xs" style={{ color: "#8585A8" }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
