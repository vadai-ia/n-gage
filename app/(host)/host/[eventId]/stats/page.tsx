"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Stats = {
  registrations: number;
  searches_started: number;
  likes: number;
  matches: number;
  photos: number;
  capacity: number | null;
};

export default function HostStatsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/stats`)
      .then((r) => r.json())
      .then((d) => { setStats(d.stats); setLoading(false); });
  }, [eventId]);

  if (loading || !stats) {
    return (
      <div className="p-4">
        {[1,2,3].map((i) => (
          <div key={i} className="h-24 rounded-2xl mb-3 animate-pulse" style={{ background: "#16161F" }} />
        ))}
      </div>
    );
  }

  const matchRate  = stats.registrations > 0 ? ((stats.matches * 2 / stats.registrations) * 100).toFixed(1) : "0";
  const searchRate = stats.registrations > 0 ? ((stats.searches_started / stats.registrations) * 100).toFixed(1) : "0";
  const photoRate  = stats.registrations > 0 ? (stats.photos / (stats.registrations * 10) * 100).toFixed(1) : "0";

  const metrics = [
    {
      icon: "👥", title: "Registros",
      value: stats.registrations,
      sub: stats.capacity ? `de ${stats.capacity} máx (${((stats.registrations / stats.capacity) * 100).toFixed(0)}%)` : "sin límite",
      color: "#1A6EFF",
      bar: stats.capacity ? stats.registrations / stats.capacity : 1,
    },
    {
      icon: "🔍", title: "Búsquedas iniciadas",
      value: stats.searches_started,
      sub: `${searchRate}% de los registrados`,
      color: "#7B2FBE",
      bar: parseFloat(searchRate) / 100,
    },
    {
      icon: "❤️", title: "Likes dados",
      value: stats.likes,
      sub: `${stats.registrations > 0 ? (stats.likes / stats.registrations).toFixed(1) : 0} likes por persona`,
      color: "#FF2D78",
      bar: Math.min(1, stats.likes / (stats.registrations * 10 || 1)),
    },
    {
      icon: "💑", title: "Matches generados",
      value: stats.matches,
      sub: `${matchRate}% de los participantes hizo match`,
      color: "#FF2D78",
      bar: parseFloat(matchRate) / 100,
    },
    {
      icon: "📸", title: "Fotos tomadas",
      value: stats.photos,
      sub: `${photoRate}% de la capacidad total`,
      color: "#F59E0B",
      bar: parseFloat(photoRate) / 100,
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-5">Estadísticas</h1>

      <div className="flex flex-col gap-3">
        {metrics.map((m) => (
          <div key={m.title} className="rounded-2xl p-4"
            style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{m.icon}</span>
                <p className="font-semibold text-sm">{m.title}</p>
              </div>
              <span className="text-2xl font-black" style={{ color: m.color }}>{m.value}</span>
            </div>
            {/* Barra de progreso */}
            <div className="h-1.5 rounded-full overflow-hidden mb-1.5"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, m.bar * 100)}%`, background: m.color }} />
            </div>
            <p className="text-xs" style={{ color: "#555" }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Resumen ejecutivo */}
      <div className="rounded-2xl p-4 mt-4"
        style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.15)" }}>
        <p className="font-bold mb-2" style={{ color: "#FF2D78" }}>✨ Resumen del evento</p>
        <p className="text-sm" style={{ color: "#ccc", lineHeight: 1.7 }}>
          <strong>{stats.registrations}</strong> solteros participaron,
          se generaron <strong>{stats.matches}</strong> matches y se tomaron{" "}
          <strong>{stats.photos}</strong> fotos. Una tasa de match del{" "}
          <strong style={{ color: "#FF2D78" }}>{matchRate}%</strong>.
        </p>
      </div>
    </div>
  );
}
