"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Photo = {
  id: string;
  cloudinary_url: string;
  thumbnail_url: string | null;
  taken_at: string;
  is_visible: boolean;
  device_info: string | null;
  user: { full_name: string };
};

export default function HostAlbumPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [photos, setPhotos]     = useState<Photo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [filter, setFilter]     = useState<"all" | "visible" | "pending">("all");

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/photos?all=true`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d.photos ?? []); setLoading(false); });
  }, [eventId]);

  const filtered = photos.filter((p) => {
    if (filter === "visible") return p.is_visible;
    if (filter === "pending") return !p.is_visible;
    return true;
  });

  const visible  = photos.filter((p) => p.is_visible).length;
  const pending  = photos.filter((p) => !p.is_visible).length;

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-8 w-40 rounded-xl mb-4 animate-pulse" style={{ background: "#16161F" }} />
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg animate-pulse" style={{ background: "#16161F" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Álbum del Evento</h1>
        <span className="text-sm font-bold" style={{ color: "#A0A0B0" }}>
          {photos.length} fotos
        </span>
      </div>
      <p className="text-sm mb-4" style={{ color: "#A0A0B0" }}>
        <span style={{ color: "#4ade80" }}>✓ {visible} disponibles</span>
        {pending > 0 && <span style={{ color: "#555" }}> · 🔒 {pending} pendientes</span>}
      </p>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {(["all", "visible", "pending"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: filter === f ? "rgba(123,47,190,0.3)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${filter === f ? "#7B2FBE" : "rgba(255,255,255,0.08)"}`,
              color: filter === f ? "#FF2D78" : "#A0A0B0",
            }}>
            {f === "all" ? "Todas" : f === "visible" ? "Disponibles" : "Pendientes"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📷</div>
          <p style={{ color: "#A0A0B0" }}>No hay fotos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {filtered.map((photo) => (
            <button key={photo.id} onClick={() => setSelected(photo)}
              className="aspect-square rounded-lg overflow-hidden relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnail_url || photo.cloudinary_url}
                alt={`Foto de ${photo.user.full_name}`}
                className="w-full h-full object-cover"
                style={{ filter: photo.is_visible ? "none" : "blur(8px) brightness(0.5)" }}
                loading="lazy"
              />
              {!photo.is_visible && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">🔒</span>
                </div>
              )}
              {/* Nombre en hover */}
              <div className="absolute bottom-0 left-0 right-0 py-1 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.7)" }}>
                <p className="text-xs truncate">{photo.user.full_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal foto */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.cloudinary_url} alt="Foto"
              className="w-full rounded-2xl mb-3 object-cover" style={{ maxHeight: "55vh" }} />

            <div className="rounded-xl p-3 mb-3"
              style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="font-semibold text-sm">{selected.user.full_name}</p>
              <p className="text-xs mt-0.5" style={{ color: "#A0A0B0" }}>
                {new Date(selected.taken_at).toLocaleString("es-MX")}
              </p>
              <p className="text-xs mt-0.5" style={{ color: selected.is_visible ? "#4ade80" : "#F59E0B" }}>
                {selected.is_visible ? "✓ Visible en álbum" : "🔒 Pendiente de liberación"}
              </p>
            </div>

            <div className="flex gap-2">
              <a href={selected.cloudinary_url} download target="_blank" rel="noreferrer"
                className="flex-1 py-3 rounded-xl font-bold text-sm text-center"
                style={{ background: "linear-gradient(135deg, #7B2FBE, #1A6EFF)", color: "#fff" }}>
                ⬇️ Descargar
              </a>
              <button onClick={() => setSelected(null)}
                className="py-3 px-4 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc" }}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
