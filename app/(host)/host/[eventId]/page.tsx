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

const TYPE_EMOJI: Record<string, string> = {
  wedding: "💍", birthday: "🎂", corporate: "💼",
  graduation: "🎓", concert: "🎵", cruise: "🚢", other: "🎉",
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
      <div className="p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl mb-3 animate-pulse" style={{ background: "#16161F" }} />
        ))}
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

  return (
    <div className="p-4">
      {/* Header del evento */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: "linear-gradient(135deg, rgba(120,75,160,0.2), rgba(43,134,197,0.1))",
          border: "1px solid rgba(120,75,160,0.3)" }}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{TYPE_EMOJI[event.type] ?? "🎉"}</span>
          <div>
            <h1 className="text-xl font-bold leading-tight">{event.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: "#A0A0B0" }}>
              {eventDate}
              {event.venue_city ? ` · ${event.venue_city}` : ""}
            </p>
            <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full capitalize"
              style={{ background: "rgba(120,75,160,0.3)", color: "#c48dff" }}>
              {event.status}
            </span>
          </div>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: "👥", value: stats?.registrations ?? 0, label: "Solteros registrados",
            sub: stats?.capacity ? `de ${stats.capacity}` : "" },
          { icon: "💑", value: stats?.matches ?? 0,       label: "Matches generados", sub: "" },
          { icon: "❤️", value: stats?.likes ?? 0,          label: "Likes dados",  sub: "" },
          { icon: "📸", value: stats?.photos ?? 0,         label: "Fotos tomadas",
            sub: `de ${(stats?.registrations ?? 0) * 10} posibles` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3"
            style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-black text-2xl">{s.value}</div>
            <div className="text-xs" style={{ color: "#A0A0B0" }}>{s.label}</div>
            {s.sub && <div className="text-xs" style={{ color: "#555" }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tasa de éxito */}
      {(stats?.registrations ?? 0) > 0 && (
        <div className="rounded-xl p-4 mb-4"
          style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-sm font-semibold mb-3">Tasa de conexión</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FF3CAC, #784BA0)",
                  width: `${Math.min(100, ((stats?.searches_started ?? 0) / (stats?.registrations ?? 1)) * 100)}%`,
                }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "#FF3CAC" }}>
              {stats?.registrations
                ? Math.round(((stats.searches_started ?? 0) / stats.registrations) * 100)
                : 0}%
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: "#555" }}>
            {stats?.searches_started ?? 0} de {stats?.registrations ?? 0} iniciaron búsqueda
          </p>
        </div>
      )}

      {/* Estado del álbum */}
      <div className="rounded-xl p-4"
        style={{
          background: isAlbumReady ? "rgba(74,222,128,0.08)" : "rgba(255,60,172,0.06)",
          border: `1px solid ${isAlbumReady ? "rgba(74,222,128,0.3)" : "rgba(255,60,172,0.2)"}`,
        }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{isAlbumReady ? "✅" : "📅"}</span>
          <p className="font-semibold text-sm"
            style={{ color: isAlbumReady ? "#4ade80" : "#FF3CAC" }}>
            {isAlbumReady ? "¡Álbum disponible!" : "Álbum en preparación"}
          </p>
        </div>
        <p className="text-xs" style={{ color: "#A0A0B0" }}>
          {isAlbumReady
            ? "Ve a la pestaña Álbum para ver y descargar todas las fotos."
            : `Las fotos estarán disponibles el ${albumDate}.`}
        </p>
      </div>
    </div>
  );
}
