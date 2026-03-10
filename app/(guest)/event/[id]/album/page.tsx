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

/* ── SVG Icons ── */

function LockIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CameraIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function DownloadIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function FlagIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ImageIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

/* ── Page ── */

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

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen p-4" style={{ background: "#07070F" }}>
        <div className="h-7 w-32 rounded-xl mb-2 skeleton" />
        <div className="h-4 w-48 rounded-lg mb-6 skeleton" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24" style={{ background: "#07070F" }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(123,47,190,0.15)" }}>
            <ImageIcon size={16} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#F0F0FF" }}>
            Mi Album
          </h1>
        </div>
        <p className="text-sm mt-1" style={{ color: "#8585A8" }}>
          {photos.length === 0
            ? "Aun no has tomado fotos"
            : `${photos.length} foto${photos.length !== 1 ? "s" : ""} tomada${photos.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Pending photos banner */}
      {pendingPhotos.length > 0 && (
        <div className="rounded-2xl p-4 mb-6"
          style={{
            background: "#0F0F1A",
            border: "1px solid rgba(255,45,120,0.12)",
            boxShadow: "0 0 20px rgba(255,45,120,0.04)",
          }}>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255,45,120,0.12)" }}>
              <LockIcon size={14} />
            </div>
            <p className="font-bold text-sm" style={{ color: "#FF2D78" }}>
              {pendingPhotos.length} foto{pendingPhotos.length !== 1 ? "s" : ""} en proceso
            </p>
          </div>
          <p className="text-xs ml-[38px]" style={{ color: "#8585A8" }}>
            Estaran disponibles al dia siguiente del evento a las 12:00 AM
          </p>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(123,47,190,0.10)", border: "1px solid rgba(123,47,190,0.15)" }}>
            <CameraIcon size={32} />
          </div>
          <p className="font-bold text-base mb-1.5" style={{ color: "#F0F0FF" }}>
            Aun no has tomado fotos
          </p>
          <p className="text-sm" style={{ color: "#8585A8" }}>
            Ve a la pestana Camara para empezar
          </p>
        </div>
      )}

      {/* Visible photos grid */}
      {visiblePhotos.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ color: "#8585A8" }}>
            Disponibles ({visiblePhotos.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {visiblePhotos.map((photo) => (
              <button key={photo.id} onClick={() => setSelected(photo)}
                className="aspect-square rounded-xl overflow-hidden relative group"
                style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.cloudinary_url}
                  alt="Foto del evento"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Pending photos grid (blurred) */}
      {pendingPhotos.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-wider mt-6 mb-3"
            style={{ color: "#44445A" }}>
            Proximamente ({pendingPhotos.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {pendingPhotos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden relative"
                style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.cloudinary_url}
                  alt="Foto pendiente"
                  className="w-full h-full object-cover"
                  style={{ filter: "blur(14px) brightness(0.3) saturate(0.5)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(7,7,15,0.3)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <LockIcon size={16} className="text-[#44445A]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Selected photo modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
          style={{
            background: "rgba(7,7,15,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
          onClick={() => { if (!reporting) setSelected(null); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
            {/* Photo */}
            <div className="rounded-2xl overflow-hidden mb-4"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.cloudinary_url} alt="Foto"
                className="w-full object-cover" style={{ maxHeight: "60vh" }} />
            </div>

            {!reporting ? (
              <div className="flex gap-2.5">
                {/* Download button */}
                <button
                  onClick={() => downloadPhoto(selected.cloudinary_url, selected.id)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                    color: "#fff",
                    boxShadow: "0 4px 20px rgba(255,45,120,0.25), 0 0 40px rgba(123,47,190,0.15)",
                  }}>
                  <DownloadIcon size={16} />
                  Descargar
                </button>
                {/* Report button */}
                <button
                  onClick={() => setReporting(true)}
                  className="py-3 px-4 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors duration-200"
                  style={{
                    background: "#0F0F1A",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#8585A8",
                  }}>
                  <FlagIcon size={14} />
                  Reportar
                </button>
                {/* Close button */}
                <button
                  onClick={() => setSelected(null)}
                  className="py-3 px-3.5 rounded-xl text-sm flex items-center justify-center transition-colors duration-200"
                  style={{
                    background: "#0F0F1A",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#8585A8",
                  }}>
                  <CloseIcon size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-2xl p-4"
                style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="font-bold text-sm" style={{ color: "#F0F0FF" }}>
                  Por que reportas esta foto?
                </p>
                <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe el motivo..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none placeholder:text-[#44445A] focus:ring-1 focus:ring-[#7B2FBE]/40 transition-shadow"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#F0F0FF",
                    height: "80px",
                  }} />
                <div className="flex gap-2">
                  <button onClick={submitReport} disabled={!reportReason.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-30 transition-all duration-200 active:scale-[0.97]"
                    style={{
                      background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                      color: "#fff",
                      boxShadow: reportReason.trim()
                        ? "0 4px 16px rgba(255,45,120,0.2)"
                        : "none",
                    }}>
                    Enviar reporte
                  </button>
                  <button onClick={() => { setReporting(false); setReportReason(""); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#8585A8",
                    }}>
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
