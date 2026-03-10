"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const MAX_PHOTOS = 10;

/* ── SVG Icon Components ─────────────────────────────────────────── */

function CameraIcon({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cam-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF2D78" />
          <stop offset="1" stopColor="#7B2FBE" />
        </linearGradient>
      </defs>
      <rect x="4" y="14" width="48" height="32" rx="6" stroke="url(#cam-grad)" strokeWidth="2.5" />
      <path d="M20 14V11a4 4 0 014-4h8a4 4 0 014 4v3" stroke="url(#cam-grad)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="30" r="9" stroke="url(#cam-grad)" strokeWidth="2.5" />
      <circle cx="28" cy="30" r="4" fill="url(#cam-grad)" opacity="0.4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5L15 15M15 5L5 15" stroke="#F0F0FF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
    >
      <defs>
        <linearGradient id="spinner-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF2D78" />
          <stop offset="1" stopColor="#7B2FBE" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="11" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
      <path
        d="M14 3a11 11 0 0 1 11 11"
        stroke="url(#spinner-grad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */

export default function CameraPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [streaming, setStreaming]       = useState(false);
  const [photosTaken, setPhotosTaken]   = useState(0);
  const [uploading, setUploading]       = useState(false);
  const [lastPhoto, setLastPhoto]       = useState<string | null>(null);
  const [cameraError, setCameraError]   = useState("");
  const [flashActive, setFlashActive]   = useState(false);
  const [loadingCount, setLoadingCount] = useState(true);

  // Cargar contador de fotos
  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/photos`)
      .then((r) => r.json())
      .then((d) => { setPhotosTaken(d.photos_taken ?? 0); setLoadingCount(false); });
  }, [eventId]);

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  }, []);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  const takePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || uploading || photosTaken >= MAX_PHOTOS) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const size   = Math.min(video.videoWidth, video.videoHeight);
    canvas.width  = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d")!;
    const offsetX = (video.videoWidth  - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    // Flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 150);

    setUploading(true);
    setLastPhoto(dataUrl);

    const res = await fetch(`/api/v1/events/${eventId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataUrl,
        device_info: navigator.userAgent.slice(0, 100),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setPhotosTaken(data.photos_taken);
    }
    setUploading(false);
  }, [eventId, uploading, photosTaken]);

  const atLimit = photosTaken >= MAX_PHOTOS;

  return (
    <div className="flex flex-col" style={{ height: "100dvh", background: "#000" }}>
      {/* Flash overlay */}
      {flashActive && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{ background: "#fff", opacity: 0.85, transition: "opacity 0.15s" }}
        />
      )}

      {/* Visor */}
      <div className="relative flex-1 overflow-hidden">
        {streaming ? (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-5"
            style={{ background: "#07070F" }}
          >
            <CameraIcon size={64} />

            {cameraError ? (
              <div className="text-center px-8">
                <p className="text-sm font-medium mb-2" style={{ color: "#FF2D78" }}>
                  {cameraError}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#44445A" }}>
                  Ve a Configuraci&oacute;n &rsaquo; Privacidad &rsaquo; C&aacute;mara y activa el permiso
                </p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "#8585A8" }}>
                Toca para activar la c&aacute;mara
              </p>
            )}

            {!atLimit && (
              <button
                onClick={startCamera}
                className="px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                  color: "#F0F0FF",
                  boxShadow: "0 4px 24px rgba(255, 45, 120, 0.3)",
                }}
              >
                Activar c&aacute;mara
              </button>
            )}
          </div>
        )}

        {/* Overlay superior */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
          style={{ background: "linear-gradient(to bottom, rgba(7,7,15,0.85), transparent)" }}
        >
          <span
            className="font-black text-lg tracking-tight"
            style={{
              background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            N&apos;GAGE
          </span>

          {!loadingCount && (
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1">
                {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-colors duration-300"
                    style={{
                      background: i < photosTaken ? "#FF2D78" : "rgba(255,255,255,0.2)",
                      boxShadow: i < photosTaken ? "0 0 6px rgba(255,45,120,0.4)" : "none",
                    }}
                  />
                ))}
              </div>
              <span
                className="text-xs font-bold tabular-nums"
                style={{ color: atLimit ? "#FF2D78" : "#F0F0FF" }}
              >
                {photosTaken}/{MAX_PHOTOS}
              </span>
            </div>
          )}
        </div>

        {/* Vista previa ultima foto */}
        {lastPhoto && !uploading && (
          <div
            className="absolute bottom-24 right-4 w-16 h-16 rounded-xl overflow-hidden"
            style={{
              border: "2px solid #FF2D78",
              boxShadow: "0 4px 20px rgba(255, 45, 120, 0.25), 0 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lastPhoto} alt="Última foto" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Controles inferiores — glassmorphism */}
      <div
        className="flex-shrink-0 flex items-center justify-center gap-8 py-6"
        style={{
          background: "rgba(7,7,15,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {atLimit ? (
          <div className="text-center py-1">
            <p className="font-bold text-sm" style={{ color: "#FF2D78" }}>
              Usaste todas tus fotos
            </p>
            <p className="text-xs mt-1.5" style={{ color: "#44445A" }}>
              El &aacute;lbum estar&aacute; disponible ma&ntilde;ana
            </p>
          </div>
        ) : (
          <>
            {/* Close / stop camera button */}
            {streaming && (
              <button
                onClick={stopCamera}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <CloseIcon />
              </button>
            )}

            {/* Shutter button */}
            <button
              onClick={streaming ? takePhoto : startCamera}
              disabled={uploading}
              aria-label="Tomar foto"
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
              style={{
                background: uploading ? "rgba(255,255,255,0.08)" : "#F0F0FF",
                boxShadow: uploading
                  ? "none"
                  : "0 0 0 4px rgba(255,255,255,0.15), 0 0 30px rgba(255,45,120,0.25)",
              }}
            >
              {uploading ? (
                <SpinnerIcon />
              ) : (
                <div
                  className="w-14 h-14 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2)",
                  }}
                />
              )}
            </button>

            {/* Spacer to center shutter when streaming */}
            {streaming && <div className="w-12 h-12" />}
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
