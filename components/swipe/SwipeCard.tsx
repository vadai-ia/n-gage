"use client";

import { useRef, useState } from "react";

export type Profile = {
  user_id: string;
  selfie_url: string;
  table_number: string | null;
  relation_type: string | null;
  interests: string[] | null;
  gender: string;
  super_like_used: boolean;
  user: { full_name: string; avatar_url: string | null };
};

const RELATION_LABELS: Record<string, string> = {
  friend_bride: "Amigo/a de la novia",
  friend_groom: "Amigo/a del novio",
  family_bride: "Familia de la novia",
  family_groom: "Familia del novio",
  coworker: "Compañero/a de trabajo",
  other: "Invitado/a",
};

const INTEREST_EMOJI: Record<string, string> = {
  sports: "⚽", pets: "🐾", travel: "✈️", reading: "📚", gastronomy: "🍽️",
  art: "🎨", rock: "🎸", pop: "🎤", electronic: "🎧", regional: "🤠",
  movies: "🎬", series: "📺", videogames: "🎮", dancing: "💃",
  talking: "💬", outdoor: "🌿", chill: "☕",
};

interface SwipeCardProps {
  profile: Profile;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike: () => void;
  superLikeAvailable: boolean;
  isTop: boolean;
}

export default function SwipeCard({
  profile, onLike, onDislike, onSuperLike, superLikeAvailable, isTop,
}: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX  = useRef(0);
  const startY  = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const THRESHOLD = 80;
  const rotation  = dragX * 0.08;
  const likeOpacity    = Math.min(1, Math.max(0, dragX / THRESHOLD));
  const dislikeOpacity = Math.min(1, Math.max(0, -dragX / THRESHOLD));

  function onPointerDown(e: React.PointerEvent) {
    if (!isTop) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    setDragging(true);
    cardRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX > THRESHOLD) { setDragX(500); setTimeout(onLike, 200); }
    else if (dragX < -THRESHOLD) { setDragX(-500); setTimeout(onDislike, 200); }
    else setDragX(0);
  }

  const interests = Array.isArray(profile.interests) ? profile.interests.slice(0, 3) : [];

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="absolute inset-0 rounded-3xl overflow-hidden select-none"
      style={{
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: dragging ? "none" : "transform 0.3s ease",
        cursor: isTop ? "grab" : "default",
        touchAction: "none",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Foto */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.selfie_url || profile.user.avatar_url || "/placeholder.jpg"}
        alt={profile.user.full_name}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Overlay gradiente inferior */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />

      {/* LIKE stamp */}
      {likeOpacity > 0 && (
        <div className="absolute top-8 left-6 rotate-[-20deg] border-4 rounded-xl px-3 py-1"
          style={{ borderColor: "#4ade80", opacity: likeOpacity }}>
          <span className="text-2xl font-black" style={{ color: "#4ade80" }}>LIKE</span>
        </div>
      )}

      {/* NOPE stamp */}
      {dislikeOpacity > 0 && (
        <div className="absolute top-8 right-6 rotate-[20deg] border-4 rounded-xl px-3 py-1"
          style={{ borderColor: "#FF3CAC", opacity: dislikeOpacity }}>
          <span className="text-2xl font-black" style={{ color: "#FF3CAC" }}>NOPE</span>
        </div>
      )}

      {/* Info inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h2 className="text-2xl font-bold mb-0.5">{profile.user.full_name}</h2>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {profile.relation_type && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
              {RELATION_LABELS[profile.relation_type] ?? profile.relation_type}
            </span>
          )}
          {profile.table_number && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
              Mesa {profile.table_number}
            </span>
          )}
        </div>

        {interests.length > 0 && (
          <div className="flex gap-1.5">
            {interests.map((interest) => (
              <span key={interest} className="text-lg" title={interest}>
                {INTEREST_EMOJI[interest] ?? "✨"}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      {isTop && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); onDislike(); }}
            aria-label="No me interesa"
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              border: "2px solid rgba(255,255,255,0.2)" }}>
            ✕
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); if (superLikeAvailable) onSuperLike(); }}
            aria-label="Super like"
            disabled={!superLikeAvailable}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl disabled:opacity-30"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              border: `2px solid ${superLikeAvailable ? "#F59E0B" : "rgba(255,255,255,0.1)"}` }}>
            ⭐
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            aria-label="Me gusta"
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "rgba(255,60,172,0.3)", backdropFilter: "blur(8px)",
              border: "2px solid #FF3CAC" }}>
            ❤️
          </button>
        </div>
      )}
    </div>
  );
}
