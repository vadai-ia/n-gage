"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Photo = {
  id: string;
  cloudinary_url: string;
  thumbnail_url: string | null;
  taken_at: string;
  is_visible: boolean;
};

export default function AlbumPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [photos, setPhotos]       = useState<Photo[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Photo | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/photos`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d.photos ?? []); setLoading(false); });
  }, [eventId]);

  const visiblePhotos = photos.filter((p) => p.is_visible);
  const pendingPhotos = photos.filter((p) => !p.is_visible);

  function downloadPhoto(url: string, id: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `ngage-photo-${id}.jpg`;
    a.target = "_blank";
    a.click();
  }

  async function submitReport() {
    if (!selected || !reportReason.trim()) return;
    await fetch(`/api/v1/events/${eventId}/photos/${selected.id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason }),
    });
    setReporting(false);
    setReportReason("");
    setSelected(null);
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-7 w-24 rounded-xl mb-4 animate-pulse" style={{ background: "#16161F" }} />
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg animate-pulse" style={{ background: "#16161F" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Mi Álbum</h1>
      <p className="text-sm mb-5" style={{ color: "#A0A0B0" }}>
        {photos.length === 0
          ? "Aún no has tomado fotos"
          : `${photos.length} foto${photos.length !== 1 ? "s" : ""} tomada${photos.length !== 1 ? "s" : ""}`}
      </p>

      {/* Fotos pendientes (no visibles aún) */}
      {pendingPhotos.length > 0 && (
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: "rgba(255,60,172,0.07)", border: "1px solid rgba(255,60,172,0.2)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span>🔒</span>
            <p className="font-bold text-sm" style={{ color: "#FF3CAC" }}>
              {pendingPhotos.length} foto{pendingPhotos.length !== 1 ? "s" : ""} en proceso
            </p>
          </div>
          <p className="text-xs" style={{ color: "#A0A0B0" }}>
            Estarán disponibles al día siguiente del evento a las 12:00 AM
          </p>
        </div>
      )}

      {/* Sin fotos */}
      {photos.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📷</div>
          <p className="font-semibold mb-2">Aún no has tomado fotos</p>
          <p style={{ color: "#A0A0B0", fontSize: "14px" }}>
            Ve a la pestaña Cámara para empezar
          </p>
        </div>
      )}

      {/* Grid de fotos visibles */}
      {visiblePhotos.length > 0 && (
        <>
          <p className="text-sm font-semibold mb-3" style={{ color: "#A0A0B0" }}>
            Disponibles ({visiblePhotos.length})
          </p>
          <div className="grid grid-cols-3 gap-1">
            {visiblePhotos.map((photo) => (
              <button key={photo.id} onClick={() => setSelected(photo)}
                className="aspect-square rounded-lg overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.cloudinary_url}
                  alt="Foto del evento"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Grid de fotos pendientes (difuminadas) */}
      {pendingPhotos.length > 0 && (
        <>
          <p className="text-sm font-semibold mt-5 mb-3" style={{ color: "#555" }}>
            Próximamente ({pendingPhotos.length})
          </p>
          <div className="grid grid-cols-3 gap-1">
            {pendingPhotos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-lg overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.cloudinary_url}
                  alt="Foto pendiente"
                  className="w-full h-full object-cover"
                  style={{ filter: "blur(12px) brightness(0.4)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal foto seleccionada */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => { if (!reporting) setSelected(null); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.cloudinary_url} alt="Foto"
              className="w-full rounded-2xl mb-4 object-cover" style={{ maxHeight: "60vh" }} />

            {!reporting ? (
              <div className="flex gap-3">
                <button
                  onClick={() => downloadPhoto(selected.cloudinary_url, selected.id)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
                  ⬇️ Descargar
                </button>
                <button
                  onClick={() => setReporting(true)}
                  className="py-3 px-4 rounded-xl text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#A0A0B0" }}>
                  🚩 Reportar
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="py-3 px-4 rounded-xl text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#A0A0B0" }}>
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-sm">¿Por qué reportas esta foto?</p>
                <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe el motivo..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", height: "80px" }} />
                <div className="flex gap-2">
                  <button onClick={submitReport} disabled={!reportReason.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                    style={{ background: "#FF3CAC", color: "#fff" }}>
                    Enviar reporte
                  </button>
                  <button onClick={() => { setReporting(false); setReportReason(""); }}
                    className="flex-1 py-2.5 rounded-xl text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc" }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
