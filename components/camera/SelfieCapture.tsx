"use client";

import { useRef, useState, useCallback } from "react";

interface SelfieCaptureProps {
  onCapture: (dataUrl: string) => void;
  onRetake?: () => void;
  captured?: string | null;
}

export default function SelfieCapture({ onCapture, onRetake, captured }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = useCallback(async (mode: "user" | "environment" = facingMode) => {
    setError("");
    setLoading(true);
    // Stop existing stream first
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError("No se pudo acceder a la camara. Verifica los permisos en tu navegador.");
    } finally {
      setLoading(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  }, []);

  const flipCamera = useCallback(() => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  const takeSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    // Mirror only front camera
    if (facingMode === "user") {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    stopCamera();
    onCapture(dataUrl);
  }, [stopCamera, onCapture, facingMode]);

  const handleRetake = useCallback(() => {
    onRetake?.();
    startCamera();
  }, [onRetake, startCamera]);

  // Preview captured
  if (captured) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden"
          style={{ border: "3px solid #FF2D78", boxShadow: "0 0 20px rgba(255,45,120,0.4)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={captured} alt="Tu selfie" className="w-full h-full object-cover" />
        </div>
        <p className="text-sm" style={{ color: "#8585A8" }}>Tu selfie esta lista</p>
        <button onClick={handleRetake} className="text-sm underline" style={{ color: "#FF2D78" }}>
          Tomar otra
        </button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Camera viewfinder */}
      <div className="relative w-64 h-64 rounded-2xl overflow-hidden"
        style={{ background: "#0A0A0F", border: "2px solid rgba(255,255,255,0.1)" }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none", display: streaming ? "block" : "none" }}
          playsInline
          muted
        />
        {!streaming && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#8585A8" strokeWidth="1.5">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <p className="text-xs" style={{ color: "#8585A8" }}>Camara frontal (selfie)</p>
          </div>
        )}

        {/* Flip camera button */}
        {streaming && (
          <button
            type="button"
            onClick={flipCamera}
            className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            aria-label="Cambiar camara"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F0F0FF" strokeWidth="1.5">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <path d="M9 13a3 3 0 106 0 3 3 0 00-6 0" />
              <path d="M17 8l-1.5-1M7 8l1.5-1" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="rounded-xl p-3 text-sm text-center max-w-xs"
          style={{ background: "rgba(255,45,120,0.1)", border: "1px solid rgba(255,45,120,0.3)", color: "#FF2D78" }}>
          {error}
          <br />
          <span className="text-xs" style={{ color: "#8585A8" }}>
            Ve a Configuracion &gt; Privacidad &gt; Camara y permite el acceso
          </span>
        </div>
      )}

      {!streaming ? (
        <button
          onClick={() => startCamera()}
          disabled={loading}
          className="px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}
        >
          {loading ? "Activando camara..." : "Activar camara"}
        </button>
      ) : (
        <button
          onClick={takeSelfie}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
            boxShadow: "0 0 0 4px rgba(255,45,120,0.3)" }}
          aria-label="Tomar selfie"
        >
          <svg width="24" height="24" fill="#fff" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
      )}
    </div>
  );
}
