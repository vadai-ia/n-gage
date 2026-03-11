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

  const startCamera = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError("No se pudo acceder a la cámara. Verifica los permisos en tu navegador.");
    } finally {
      setLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  }, []);

  const takeSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    // Centrar y voltear horizontalmente (efecto espejo)
    ctx.save();
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
    ctx.restore();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    stopCamera();
    onCapture(dataUrl);
  }, [stopCamera, onCapture]);

  const handleRetake = useCallback(() => {
    onRetake?.();
    startCamera();
  }, [onRetake, startCamera]);

  // Si ya hay selfie capturada, mostrar preview
  if (captured) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden"
          style={{ border: "3px solid #FF3CAC", boxShadow: "0 0 20px rgba(255,60,172,0.4)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={captured} alt="Tu selfie" className="w-full h-full object-cover" />
        </div>
        <p className="text-sm" style={{ color: "#A0A0B0" }}>
          Tu selfie del día está lista ✨
        </p>
        <button onClick={handleRetake} className="text-sm underline" style={{ color: "#FF3CAC" }}>
          Tomar otra
        </button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visor de cámara */}
      <div className="relative w-64 h-64 rounded-2xl overflow-hidden"
        style={{ background: "#0A0A0F", border: "2px solid rgba(255,255,255,0.1)" }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)", display: streaming ? "block" : "none" }}
          playsInline
          muted
        />
        {!streaming && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">🤳</span>
            <p className="text-sm" style={{ color: "#A0A0B0" }}>Cámara frontal</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="rounded-xl p-3 text-sm text-center max-w-xs"
          style={{ background: "rgba(255,60,172,0.1)", border: "1px solid rgba(255,60,172,0.3)", color: "#FF3CAC" }}>
          {error}
          <br />
          <span style={{ color: "#A0A0B0", fontSize: "12px" }}>
            Ve a Configuración → Privacidad → Cámara y permite el acceso
          </span>
        </div>
      )}

      {!streaming ? (
        <button
          onClick={startCamera}
          disabled={loading}
          className="px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}
        >
          {loading ? "Activando cámara..." : "Activar cámara"}
        </button>
      ) : (
        <button
          onClick={takeSelfie}
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)",
            boxShadow: "0 0 0 4px rgba(255,60,172,0.3)" }}
          aria-label="Tomar selfie"
        >
          📸
        </button>
      )}
    </div>
  );
}
