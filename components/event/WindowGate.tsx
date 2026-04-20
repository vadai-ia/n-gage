"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

type WindowStatus = "before_start" | "open" | "ended" | "no_window" | "loading";

interface WindowGateProps {
  eventId: string;
  /** Which pages are allowed in each state */
  allowWhenEnded?: boolean;
  children: React.ReactNode;
}

export default function WindowGate({ eventId, allowWhenEnded = false, children }: WindowGateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<WindowStatus>("loading");
  const [countdown, setCountdown] = useState("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/window-status`)
      .then((r) => r.json())
      .then((d) => {
        setStatus(d.window_status ?? "no_window");
        setStartTime(d.search_start_time ?? null);
        setDuration(d.search_duration_minutes ?? 0);
      })
      .catch(() => setStatus("no_window"));
  }, [eventId]);

  // Countdown ticker
  useEffect(() => {
    if (status !== "before_start" || !startTime) return;
    const interval = setInterval(() => {
      const diff = new Date(startTime).getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        setStatus("open");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h > 0 ? h + "h " : ""}${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [status, startTime]);

  // Loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070F" }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // Open or no window = show children
  if (status === "open" || status === "no_window") {
    return <>{children}</>;
  }

  // Ended — show children if allowed (likes/matches), otherwise show ended screen
  if (status === "ended") {
    if (allowWhenEnded) return <>{children}</>;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#07070F" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={1.5}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" />
              <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#F0F0FF" }}>La busqueda ha cerrado</h2>
          <p className="text-sm mb-6" style={{ color: "#8585A8" }}>
            La ventana de swipe termino. Revisa tus likes y matches.
          </p>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/event/${eventId}/likes`)}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-transform active:scale-95"
              style={{ background: "rgba(255,45,120,0.12)", border: "1px solid rgba(255,45,120,0.2)", color: "#FF2D78" }}>
              Ver likes
            </button>
            <button onClick={() => router.push(`/event/${eventId}/matches`)}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-transform active:scale-95"
              style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
              Ver matches
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Before start = countdown + instructions
  const formattedStart = startTime
    ? new Date(startTime).toLocaleString("es-MX", { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#07070F" }}>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(123,47,190,0.08) 0%, transparent 70%)" }} />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xs">
        <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: "rgba(123,47,190,0.1)", border: "1px solid rgba(123,47,190,0.2)" }}>
          <svg width={36} height={36} fill="none" viewBox="0 0 24 24" stroke="#7B2FBE" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="text-xl font-black mb-2" style={{ color: "#F0F0FF" }}>El swipe abre en</h1>

        <div className="rounded-2xl p-4 mb-3"
          style={{ background: "rgba(123,47,190,0.08)", border: "1px solid rgba(123,47,190,0.15)" }}>
          <p className="text-3xl font-black font-mono tracking-wider" style={{ color: "#A855F7" }}>
            {countdown || "..."}
          </p>
        </div>

        {formattedStart && (
          <p className="text-xs capitalize mb-4" style={{ color: "#8585A8" }}>{formattedStart}</p>
        )}

        {/* Instructions */}
        <div className="flex flex-col gap-2 text-left mb-4">
          {[
            { n: "1", text: "Completa tu perfil para el evento" },
            { n: "2", text: "Toma tu mejor selfie del dia" },
            { n: "3", text: `${duration} min para hacer swipe y conectar` },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                style={{ background: "rgba(255,45,120,0.1)", color: "#FF2D78" }}>{s.n}</div>
              <p className="text-xs font-medium" style={{ color: "#8585A8" }}>{s.text}</p>
            </div>
          ))}
        </div>

        <button onClick={() => router.push(`/event/${eventId}/profile`)}
          className="w-full py-3 rounded-xl text-sm font-bold transition-transform active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
          Completar mi perfil
        </button>

        <p className="text-xs mt-3" style={{ color: "#44445A" }}>
          La pagina se actualiza automaticamente cuando abra.
        </p>
      </motion.div>
    </div>
  );
}
