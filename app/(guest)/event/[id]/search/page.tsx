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
};

type MatchData = {
  id: string;
  user_a_id: string;
  user_b_id: string;
};

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

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/profiles`)
      .then((r) => r.json())
      .then((d) => {
        setProfiles(d.profiles ?? []);
        setMyReg(d.my_registration ?? null);
        if (d.my_registration?.search_started_at) setStarted(true);
        if (d.my_registration?.search_expires_at) {
          const exp = new Date(d.my_registration.search_expires_at) < new Date();
          setExpired(exp);
          // Calculate total duration
          if (d.my_registration.search_started_at) {
            const total = new Date(d.my_registration.search_expires_at).getTime()
              - new Date(d.my_registration.search_started_at).getTime();
            setEventDuration(total / 60000);
          }
        }
        setLoading(false);
      });
  }, [eventId]);

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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#07070F" }}>
        {/* Subtle glow behind */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)" }} />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.1)", border: "1px solid rgba(255,45,120,0.15)" }}>
            <svg width={40} height={40} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-3xl font-black mb-3" style={{ color: "#F0F0FF" }}>
            ¿Listo para conectar?
          </h1>
          <p className="mb-1" style={{ color: "#8585A8" }}>
            Hay <strong style={{ color: "#FF2D78" }}>{profiles.length}</strong> personas esperando
          </p>
          <p className="text-xs mb-10" style={{ color: "#44445A" }}>
            El timer empieza en cuanto presiones el botón
          </p>

          <button
            onClick={handleStartSearch}
            disabled={starting}
            className="px-10 py-5 rounded-2xl font-black text-xl disabled:opacity-60 transition-transform active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
              boxShadow: "0 12px 40px rgba(255,45,120,0.4)",
              color: "#fff",
            }}
          >
            {starting ? "Iniciando..." : "INICIAR BÚSQUEDA"}
          </button>
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
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={1.5}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" />
              <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#F0F0FF" }}>¡Eso es todo!</h2>
          <p className="text-sm mb-8" style={{ color: "#8585A8" }}>
            Ya viste todos los perfiles. Revisa tus likes.
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
