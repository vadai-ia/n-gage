"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type EventDetail = {
  id: string;
  name: string;
  type: string;
  event_date: string;
  venue_name: string | null;
  venue_city: string | null;
  status: string;
  unique_slug: string;
  qr_code_url: string | null;
  search_duration_minutes: number;
  expiry_days: number;
  plan: string;
  access_codes: { code: string }[];
  _count: { registrations: number; matches: number; photos: number };
};

type Stats = {
  registrations: number;
  searches_started: number;
  likes: number;
  matches: number;
  photos: number;
  capacity: number | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:   { label: "Borrador", color: "#A0A0B0" },
  active:  { label: "Activo",   color: "#FF3CAC" },
  closed:  { label: "Cerrado",  color: "#2B86C5" },
  expired: { label: "Expirado", color: "#666" },
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/events/${id}`).then((r) => r.json()),
      fetch(`/api/v1/events/${id}/stats`).then((r) => r.json()),
    ]).then(([evData, statsData]) => {
      setEvent(evData.event);
      setStats(statsData.stats);
      setLoading(false);
    });
  }, [id]);

  async function toggleStatus() {
    if (!event) return;
    setActivating(true);
    const newStatus = event.status === "active" ? "closed" : "active";
    await fetch(`/api/v1/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setEvent((e) => e ? { ...e, status: newStatus } : e);
    setActivating(false);
  }

  function downloadQR() {
    if (!event?.qr_code_url) return;
    const a = document.createElement("a");
    a.href = event.qr_code_url;
    a.download = `qr-${event.unique_slug}.png`;
    a.click();
  }

  function copyLink() {
    const code = event?.access_codes?.[0]?.code ?? "";
    const url = `${window.location.origin}/e/${event?.unique_slug}${code ? `?code=${code}` : ""}`;
    navigator.clipboard.writeText(url);
  }

  if (loading || !event) {
    return (
      <div className="p-4">
        <div className="h-8 w-40 rounded-xl mb-4 animate-pulse" style={{ background: "#16161F" }} />
        <div className="h-48 rounded-2xl animate-pulse" style={{ background: "#16161F" }} />
      </div>
    );
  }

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const code = event.access_codes?.[0]?.code ?? "";
  const eventUrl = `${appUrl}/e/${event.unique_slug}${code ? `?code=${code}` : ""}`;
  const statusInfo = STATUS_LABELS[event.status] ?? STATUS_LABELS.draft;
  const eventDate = new Date(event.event_date).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-4 pb-8">
      <button onClick={() => router.push("/dashboard")} className="text-sm mb-4 flex items-center gap-1"
        style={{ color: "#A0A0B0" }}>
        ← Mis eventos
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{event.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: "#A0A0B0" }}>
            {eventDate}
            {event.venue_city ? ` · ${event.venue_city}` : ""}
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
          style={{ background: `${statusInfo.color}22`, color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>
          {statusInfo.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: "👥", val: stats?.registrations ?? 0, label: "Registros", sub: stats?.capacity ? `de ${stats.capacity}` : "" },
          { icon: "💑", val: stats?.matches ?? 0, label: "Matches", sub: "" },
          { icon: "📸", val: stats?.photos ?? 0, label: "Fotos", sub: "" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl mb-0.5">{s.icon}</div>
            <div className="font-bold text-lg">{s.val}</div>
            <div className="text-xs" style={{ color: "#A0A0B0" }}>{s.label}</div>
            {s.sub && <div className="text-xs" style={{ color: "#555" }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Stats extra */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          { icon: "🔍", val: stats?.searches_started ?? 0, label: "Búsquedas iniciadas" },
          { icon: "❤️", val: stats?.likes ?? 0, label: "Likes dados" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="font-bold">{s.val}</div>
              <div className="text-xs" style={{ color: "#A0A0B0" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* QR */}
      {event.qr_code_url && (
        <div className="rounded-2xl p-4 mb-4 text-center"
          style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-sm font-bold mb-3">Código QR del evento</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.qr_code_url} alt="QR del evento"
            className="w-40 h-40 mx-auto rounded-xl mb-3" style={{ imageRendering: "pixelated" }} />
          <p className="text-xs mb-3 break-all" style={{ color: "#A0A0B0" }}>{eventUrl}</p>
          <div className="flex gap-2">
            <button onClick={copyLink}
              className="flex-1 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc" }}>
              📋 Copiar link
            </button>
            <button onClick={downloadQR}
              className="flex-1 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(255,60,172,0.1)", border: "1px solid rgba(255,60,172,0.3)", color: "#FF3CAC" }}>
              ⬇️ Descargar QR
            </button>
          </div>
        </div>
      )}

      {/* Código de acceso */}
      {code && (
        <div className="rounded-xl p-3 mb-4 flex items-center justify-between"
          style={{ background: "rgba(255,60,172,0.06)", border: "1px solid rgba(255,60,172,0.2)" }}>
          <div>
            <p className="text-xs" style={{ color: "#A0A0B0" }}>Código de acceso</p>
            <p className="font-mono font-bold text-lg tracking-widest" style={{ color: "#FF3CAC" }}>{code}</p>
          </div>
          <span className="text-xs" style={{ color: "#555" }}>Ya embebido en el QR</span>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3">
        <button onClick={toggleStatus} disabled={activating}
          className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60"
          style={{
            background: event.status === "active"
              ? "rgba(43,134,197,0.15)" : "linear-gradient(135deg, #FF3CAC, #784BA0)",
            border: event.status === "active" ? "1px solid #2B86C5" : "none",
            color: event.status === "active" ? "#2B86C5" : "#fff",
          }}>
          {activating ? "Actualizando..." : event.status === "active" ? "⏸ Cerrar evento" : "▶ Activar evento"}
        </button>

        <button onClick={() => router.push(`/events/${id}/guests`)}
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#ccc" }}>
          👥 Ver invitados
        </button>
      </div>
    </div>
  );
}
