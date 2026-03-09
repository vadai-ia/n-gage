"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const MAX_PHOTOS = 10;

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
        <div className="fixed inset-0 z-50 bg-white pointer-events-none"
          style={{ opacity: 0.8, transition: "opacity 0.15s" }} />
      )}

      {/* Visor */}
      <div className="relative flex-1 overflow-hidden">
        {streaming ? (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4"
            style={{ background: "#0A0A0F" }}>
            <span className="text-6xl">📷</span>
            {cameraError ? (
              <div className="text-center px-6">
                <p className="text-sm mb-2" style={{ color: "#FF3CAC" }}>{cameraError}</p>
                <p className="text-xs" style={{ color: "#555" }}>
                  Ve a Configuración › Privacidad › Cámara y activa el permiso
                </p>
              </div>
            ) : (
              <p style={{ color: "#A0A0B0" }}>Toca para activar la cámara</p>
            )}
            {!atLimit && (
              <button onClick={startCamera}
                className="px-6 py-3 rounded-xl font-bold"
                style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
                Activar cámara
              </button>
            )}
          </div>
        )}

        {/* Overlay superior */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}>
          <span className="font-bold gradient-text" style={{ fontFamily: "var(--font-playfair)" }}>
            N&apos;GAGE
          </span>
          {!loadingCount && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full"
                    style={{ background: i < photosTaken ? "#FF3CAC" : "rgba(255,255,255,0.3)" }} />
                ))}
              </div>
              <span className="text-sm font-bold"
                style={{ color: atLimit ? "#FF3CAC" : "#fff" }}>
                {photosTaken}/{MAX_PHOTOS}
              </span>
            </div>
          )}
        </div>

        {/* Vista previa última foto */}
        {lastPhoto && !uploading && (
          <div className="absolute bottom-24 right-4 w-16 h-16 rounded-xl overflow-hidden"
            style={{ border: "2px solid #FF3CAC", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lastPhoto} alt="Última foto" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      <div className="flex-shrink-0 flex items-center justify-center gap-8 py-6"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>

        {atLimit ? (
          <div className="text-center">
            <p className="font-bold text-sm" style={{ color: "#FF3CAC" }}>
              ¡Usaste todas tus fotos!
            </p>
            <p className="text-xs mt-1" style={{ color: "#555" }}>
              El álbum estará disponible mañana
            </p>
          </div>
        ) : (
          <>
            {streaming && (
              <button onClick={stopCamera}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                ✕
              </button>
            )}

            {/* Botón disparador */}
            <button
              onClick={streaming ? takePhoto : startCamera}
              disabled={uploading}
              aria-label="Tomar foto"
              className="w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
              style={{
                background: uploading ? "#333" : "white",
                border: "4px solid rgba(255,255,255,0.3)",
                boxShadow: "0 0 0 2px rgba(255,255,255,0.1)",
              }}>
              {uploading ? (
                <span className="text-2xl animate-spin">⏳</span>
              ) : (
                <div className="w-14 h-14 rounded-full" style={{ background: "#FF3CAC" }} />
              )}
            </button>

            {streaming && (
              <div className="w-12 h-12" /> /* spacer para centrar el botón */
            )}
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
