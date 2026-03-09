"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

  const [profiles, setProfiles]     = useState<Profile[]>([]);
  const [myReg, setMyReg]           = useState<MyReg | null>(null);
  const [loading, setLoading]       = useState(true);
  const [started, setStarted]       = useState(false);
  const [expired, setExpired]       = useState(false);
  const [starting, setStarting]     = useState(false);
  const [match, setMatch]           = useState<{ data: MatchData; profile: Profile } | null>(null);

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/profiles`)
      .then((r) => r.json())
      .then((d) => {
        setProfiles(d.profiles ?? []);
        setMyReg(d.my_registration ?? null);
        if (d.my_registration?.search_started_at) setStarted(true);
        if (d.my_registration?.search_expires_at) {
          const expired = new Date(d.my_registration.search_expires_at) < new Date();
          setExpired(expired);
        }
        setLoading(false);
      });
  }, [eventId]);

  async function handleStartSearch() {
    setStarting(true);
    const res = await fetch(`/api/v1/events/${eventId}/start-my-search`, { method: "POST" });
    const data = await res.json();
    setMyReg(data.registration);
    setStarted(true);
    setStarting(false);
  }

  const sendLike = useCallback(async (toUserId: string, type: "like" | "dislike" | "super_like") => {
    const res = await fetch(`/api/v1/events/${eventId}/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user_id: toUserId, type }),
    });
    const data = await res.json();
    return data;
  }, [eventId]);

  const handleAction = useCallback(async (type: "like" | "dislike" | "super_like") => {
    if (!profiles.length) return;
    const current = profiles[0];

    // Quitar la tarjeta del stack optimistamente
    setProfiles((prev) => prev.slice(1));

    const result = await sendLike(current.user_id, type);

    if (result.is_match && result.match) {
      setMatch({ data: result.match, profile: current });
    }

    // Actualizar super like
    if (type === "super_like") {
      setMyReg((r) => r ? { ...r, super_like_used: true } : r);
    }
  }, [profiles, sendLike]);

  // ── LOADING ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0F" }}>
        <div className="text-4xl animate-pulse">💫</div>
      </div>
    );
  }

  // ── NO REGISTRADO ────────────────────────────────
  if (!myReg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold mb-2">No estás registrado</h2>
        <p style={{ color: "#A0A0B0" }}>Necesitas registrarte en el evento primero.</p>
      </div>
    );
  }

  // ── PANTALLA DE INICIO ───────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-black mb-2 gradient-text" style={{ fontFamily: "var(--font-playfair)" }}>
          ¿Listo para conectar?
        </h1>
        <p className="mb-2" style={{ color: "#A0A0B0" }}>
          Hay <strong style={{ color: "#fff" }}>{profiles.length}</strong> personas esperando conocerte
        </p>
        <p className="text-sm mb-10" style={{ color: "#555" }}>
          El timer empieza en cuanto presiones el botón
        </p>
        <button
          onClick={handleStartSearch}
          disabled={starting}
          className="px-10 py-5 rounded-2xl font-black text-2xl disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)",
            boxShadow: "0 12px 40px rgba(255,60,172,0.5)", color: "#fff" }}>
          {starting ? "Iniciando..." : "INICIAR BÚSQUEDA 🔥"}
        </button>
      </div>
    );
  }

  // ── TIEMPO AGOTADO ───────────────────────────────
  if (expired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold mb-2">¡Tiempo agotado!</h2>
        <p className="mb-6" style={{ color: "#A0A0B0" }}>
          Tu sesión de búsqueda terminó. Revisa tus likes y matches.
        </p>
        <button onClick={() => router.push(`/event/${eventId}/likes`)}
          className="px-6 py-3 rounded-xl font-bold"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
          Ver mis likes ❤️
        </button>
      </div>
    );
  }

  // ── SIN MÁS PERFILES ────────────────────────────
  if (profiles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">¡Eso es todo!</h2>
        <p className="mb-6" style={{ color: "#A0A0B0" }}>
          Ya viste todos los perfiles disponibles. Revisa si alguien te dio like.
        </p>
        <button onClick={() => router.push(`/event/${eventId}/likes`)}
          className="px-6 py-3 rounded-xl font-bold"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
          Ver mis likes ❤️
        </button>
      </div>
    );
  }

  // ── SWIPE MODE ───────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 z-10"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <span className="font-bold gradient-text" style={{ fontFamily: "var(--font-playfair)" }}>
          N&apos;GAGE
        </span>
        {myReg.search_expires_at && (
          <Timer expiresAt={myReg.search_expires_at} onExpire={() => setExpired(true)} />
        )}
        <span className="text-sm" style={{ color: "#A0A0B0" }}>
          {profiles.length} restantes
        </span>
      </div>

      {/* Stack de tarjetas */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="relative w-full max-w-sm" style={{ height: "520px" }}>
          {profiles.slice(0, 3).map((profile, index) => (
            <div
              key={profile.user_id}
              className="absolute inset-0"
              style={{
                transform: `scale(${1 - index * 0.03}) translateY(${index * 10}px)`,
                zIndex: 3 - index,
                transition: "transform 0.3s ease",
              }}
            >
              <SwipeCard
                profile={profile}
                isTop={index === 0}
                onLike={() => handleAction("like")}
                onDislike={() => handleAction("dislike")}
                onSuperLike={() => handleAction("super_like")}
                superLikeAvailable={!myReg.super_like_used}
              />
            </div>
          ))}
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
