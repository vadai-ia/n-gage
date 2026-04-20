"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import SwipeCard, { type Profile } from "@/components/swipe/SwipeCard";
import MatchModal from "@/components/swipe/MatchModal";
import Timer from "@/components/event/Timer";

type MyReg = {
  search_started_at: string | null;
  search_expires_at: string | null;
  super_like_used: boolean;
  selfie_url: string;
  user_id: string;
  interests: string[] | null;
  looking_for: string;
};

type MatchData = {
  id: string;
  user_a_id: string;
  user_b_id: string;
};

type WindowStatus = "open" | "before_start" | "ended" | null;

export default function SearchPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [myReg, setMyReg] = useState<MyReg | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [starting, setStarting] = useState(false);
  const [match, setMatch] = useState<{ data: MatchData; profile: Profile } | null>(null);
  const [eventDuration, setEventDuration] = useState<number | undefined>();
  const [singlesCount, setSinglesCount] = useState<number>(0);
  const [windowStatus, setWindowStatus] = useState<WindowStatus>(null);
  const [searchStartTime, setSearchStartTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");

  const loadProfiles = useCallback(() => {
    fetch(`/api/v1/events/${eventId}/profiles`)
      .then((r) => r.json())
      .then((d) => {
        if (d.window_status === "before_start") {
          setWindowStatus("before_start");
          setSearchStartTime(d.search_start_time ?? null);
          setLoading(false);
          return;
        }
        if (d.window_status === "ended") {
          setWindowStatus("ended");
          setLoading(false);
          return;
        }
        setWindowStatus("open");
        setProfiles(d.profiles ?? []);
        setMyReg(d.my_registration ?? null);
        setSinglesCount(d.singles_count ?? (d.profiles?.length ?? 0));
        if (d.my_registration?.search_started_at) setStarted(true);
        if (d.my_registration?.search_expires_at) {
          const exp = new Date(d.my_registration.search_expires_at) < new Date();
          setExpired(exp);
          if (d.my_registration.search_started_at) {
            const total = new Date(d.my_registration.search_expires_at).getTime()
              - new Date(d.my_registration.search_started_at).getTime();
            setEventDuration(total / 60000);
          }
        }
        setLoading(false);
      });
  }, [eventId]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Countdown ticker + auto-refresh when window opens
  useEffect(() => {
    if (windowStatus !== "before_start" || !searchStartTime) return;
    const interval = setInterval(() => {
      const diff = new Date(searchStartTime).getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        loadProfiles();
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(
        `${h > 0 ? h + "h " : ""}${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [windowStatus, searchStartTime, loadProfiles]);

  // Auto-refresh polling: cuando se acaban perfiles, intentar recargar cada 25s
  useEffect(() => {
    if (!started || expired || windowStatus !== "open") return;
    if (profiles.length > 0) return;
    const interval = setInterval(() => {
      loadProfiles();
    }, 25000);
    return () => clearInterval(interval);
  }, [started, expired, windowStatus, profiles.length, loadProfiles]);

  async function handleStartSearch() {
    setStarting(true);
    if (navigator.vibrate) navigator.vibrate(30);
    const res = await fetch(`/api/v1/events/${eventId}/start-my-search`, { method: "POST" });
    const data = await res.json();
    setMyReg(data.registration);
    setStarted(true);
    setStarting(false);
    if (data.registration?.search_started_at && data.registration?.search_expires_at) {
      const total = new Date(data.registration.search_expires_at).getTime()
        - new Date(data.registration.search_started_at).getTime();
      setEventDuration(total / 60000);
    }
  }

  const sendLike = useCallback(async (toUserId: string, type: "like" | "dislike" | "super_like") => {
    const res = await fetch(`/api/v1/events/${eventId}/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user_id: toUserId, type }),
    });
    return await res.json();
  }, [eventId]);

  const handleAction = useCallback(async (type: "like" | "dislike" | "super_like") => {
    if (!profiles.length) return;
    const current = profiles[0];
    setProfiles((prev) => prev.slice(1));

    const result = await sendLike(current.user_id, type);
    if (result.is_match && result.match) {
      setMatch({ data: result.match, profile: current });
    }
    if (type === "super_like") {
      setMyReg((r) => r ? { ...r, super_like_used: true } : r);
    }
  }, [profiles, sendLike]);

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070F" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
          <span className="text-xs font-medium" style={{ color: "#44445A" }}>Cargando perfiles...</span>
        </div>
      </div>
    );
  }

  // ── BEFORE WINDOW OPENS ──
  if (windowStatus === "before_start") {
    const formattedStart = searchStartTime
      ? new Date(searchStartTime).toLocaleString("es-MX", {
          weekday: "long", month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : null;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#07070F" }}>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(123,47,190,0.08) 0%, transparent 70%)" }} />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-xs"
        >
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(123,47,190,0.1)", border: "1px solid rgba(123,47,190,0.2)" }}>
            <svg width={40} height={40} fill="none" viewBox="0 0 24 24" stroke="#7B2FBE" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-2xl font-black mb-2" style={{ color: "#F0F0FF" }}>
            La búsqueda abre en
          </h1>

          <div className="rounded-2xl p-5 mb-4"
            style={{ background: "rgba(123,47,190,0.08)", border: "1px solid rgba(123,47,190,0.15)" }}>
            <p className="text-4xl font-black font-mono tracking-wider" style={{ color: "#A855F7" }}>
              {countdown || "..."}
            </p>
          </div>

          {formattedStart && (
            <p className="text-sm capitalize" style={{ color: "#8585A8" }}>
              {formattedStart}
            </p>
          )}

          <p className="text-xs mt-4" style={{ color: "#44445A" }}>
            La página se actualizará automáticamente cuando abra.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── WINDOW ENDED ──
  if (windowStatus === "ended") {
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

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#F0F0FF" }}>
            La búsqueda ha cerrado
          </h2>
          <p className="text-sm mb-8" style={{ color: "#8585A8" }}>
            La ventana de conexiones terminó. Revisa tus likes y matches.
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

  // ── NOT REGISTERED ──
  if (!myReg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#07070F" }}>
        <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
          style={{ background: "rgba(255,45,120,0.1)" }}>
          <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#F0F0FF" }}>No estás registrado</h2>
        <p className="text-sm" style={{ color: "#8585A8" }}>Necesitas registrarte en el evento primero.</p>
      </div>
    );
  }

  // ── START SCREEN ──
  if (!started) {
    const myInterests = Array.isArray(myReg?.interests) ? myReg!.interests! : [];
    const lookingForLabel = myReg
      ? ({ men: "hombres", women: "mujeres", everyone: "todos", non_binary: "no binarios" } as Record<string, string>)[myReg.looking_for] ?? "personas"
      : "personas";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#07070F" }}>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)" }} />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-xs"
        >
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.1)", border: "1px solid rgba(255,45,120,0.15)" }}>
            <svg width={40} height={40} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-3xl font-black mb-2" style={{ color: "#F0F0FF" }}>
            ¿Listo para conectar?
          </h1>

          {/* Singles count */}
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.12)" }}>
            <p className="text-4xl font-black mb-1" style={{ color: "#FF2D78" }}>{singlesCount}</p>
            <p className="text-sm" style={{ color: "#8585A8" }}>
              {lookingForLabel} buscando conexión esta noche
            </p>
          </div>

          {/* Interest recap */}
          {myInterests.length > 0 && (
            <div className="mb-6">
              <p className="text-xs mb-2" style={{ color: "#44445A" }}>Tu perfil incluye</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {myInterests.slice(0, 5).map((i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8585A8" }}>
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs mb-8" style={{ color: "#44445A" }}>
            El timer empieza en cuanto presiones el botón
          </p>

          <button
            onClick={handleStartSearch}
            disabled={starting || singlesCount === 0}
            className="w-full px-10 py-5 rounded-2xl font-black text-xl disabled:opacity-60 transition-transform active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
              boxShadow: "0 12px 40px rgba(255,45,120,0.4)",
              color: "#fff",
            }}
          >
            {starting ? "Iniciando..." : singlesCount === 0 ? "Sin perfiles aún" : "INICIAR BÚSQUEDA"}
          </button>

          {singlesCount === 0 && (
            <p className="text-xs mt-3" style={{ color: "#44445A" }}>
              Aún no hay {lookingForLabel} registrados. Regresa pronto.
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // ── EXPIRED ──
  if (expired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#07070F" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.15)" }}>
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FFB800" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#F0F0FF" }}>¡Tiempo agotado!</h2>
          <p className="text-sm mb-8" style={{ color: "#8585A8" }}>
            Tu sesión terminó. Revisa tus likes y matches.
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

  // ── NO MORE PROFILES ──
  if (profiles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#07070F" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="relative w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.15)" }}>
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "rgba(255,45,120,0.2)" }} />
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5} className="relative z-10">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#F0F0FF" }}>
            Esperando más invitados…
          </h2>
          <p className="text-sm mb-2" style={{ color: "#8585A8" }}>
            Por ahora ya viste a todos. La búsqueda se actualiza sola.
          </p>
          <p className="text-xs mb-8" style={{ color: "#44445A" }}>
            Mientras, revisa quién te dio like.
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

          <button
            onClick={() => loadProfiles()}
            className="mt-4 text-xs font-semibold underline"
            style={{ color: "#8585A8" }}
          >
            Recargar ahora
          </button>
        </motion.div>
      </div>
    );
  }

  // ── SWIPE MODE ──
  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 70px)", background: "#07070F" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 z-10 flex-shrink-0">
        <span className="font-black text-sm tracking-tight" style={{ color: "#F0F0FF" }}>
          <span style={{
            background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>N&apos;GAGE</span>
        </span>

        {myReg.search_expires_at && (
          <Timer
            expiresAt={myReg.search_expires_at}
            totalMinutes={eventDuration}
            onExpire={() => setExpired(true)}
          />
        )}

        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.05)", color: "#8585A8" }}
        >
          {profiles.length}
        </span>
      </div>

      {/* Card stack */}
      <div className="flex-1 flex items-center justify-center px-3 pb-2 overflow-hidden">
        <div className="relative w-full max-w-sm" style={{ height: "min(520px, 72vh)" }}>
          <AnimatePresence>
            {profiles.slice(0, 3).map((profile, index) => (
              <motion.div
                key={profile.user_id}
                className="absolute inset-0"
                initial={index === 0 ? { scale: 0.95, opacity: 0 } : undefined}
                animate={{
                  scale: 1 - index * 0.04,
                  y: index * 8,
                  opacity: index < 2 ? 1 : 0.5,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ zIndex: 3 - index }}
              >
                <SwipeCard
                  profile={profile}
                  isTop={index === 0}
                  onLike={() => handleAction("like")}
                  onDislike={() => handleAction("dislike")}
                  onSuperLike={() => handleAction("super_like")}
                  superLikeAvailable={!myReg.super_like_used}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Match modal */}
      {match && (
        <MatchModal
          myPhoto={myReg.selfie_url}
          theirPhoto={match.profile.selfie_url || match.profile.user.avatar_url || ""}
          theirName={match.profile.user.full_name}
          matchId={match.data.id}
          onClose={() => setMatch(null)}
          onChat={() => router.push(`/event/${eventId}/matches`)}
        />
      )}
    </div>
  );
}
