"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

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

const SWIPE_THRESHOLD = 100;
const EXIT_X = 600;

export default function SwipeCard({
  profile, onLike, onDislike, onSuperLike, superLikeAvailable, isTop,
}: SwipeCardProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const superLikeOpacity = useTransform(y, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Background tint based on drag
  const bgOverlay = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    [
      "rgba(255,45,120,0.25)",
      "rgba(255,45,120,0.05)",
      "rgba(0,0,0,0)",
      "rgba(16,185,129,0.05)",
      "rgba(16,185,129,0.25)",
    ]
  );

  const [exiting, setExiting] = useState(false);

  const exitCard = useCallback((direction: "left" | "right" | "up") => {
    if (exiting) return;
    setExiting(true);

    const targetX = direction === "left" ? -EXIT_X : direction === "right" ? EXIT_X : 0;
    const targetY = direction === "up" ? -EXIT_X : 0;

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(15);

    animate(x, targetX, { duration: 0.35, ease: "easeOut" });
    animate(y, targetY, { duration: 0.35, ease: "easeOut" });

    setTimeout(() => {
      if (direction === "right") onLike();
      else if (direction === "left") onDislike();
      else onSuperLike();
    }, 300);
  }, [exiting, x, y, onLike, onDislike, onSuperLike]);

  function handleDragEnd() {
    const xVal = x.get();
    const yVal = y.get();

    if (xVal > SWIPE_THRESHOLD) {
      exitCard("right");
    } else if (xVal < -SWIPE_THRESHOLD) {
      exitCard("left");
    } else if (yVal < -SWIPE_THRESHOLD && superLikeAvailable) {
      exitCard("up");
    } else {
      // Spring back
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  }

  const interests = Array.isArray(profile.interests) ? profile.interests.slice(0, 5) : [];
  const firstName = profile.user.full_name.split(" ")[0];

  return (
    <div ref={constraintsRef} className="absolute inset-0">
      <motion.div
        style={{ x, y, rotate }}
        drag={isTop && !exiting}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 rounded-3xl overflow-hidden select-none will-change-transform"
        whileTap={isTop ? { cursor: "grabbing" } : undefined}
      >
        {/* Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.selfie_url || profile.user.avatar_url || "/placeholder.jpg"}
          alt={profile.user.full_name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.4) 40%, transparent 70%)",
          }}
        />

        {/* Drag tint overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: bgOverlay }}
        />

        {/* LIKE stamp */}
        <motion.div
          className="absolute top-12 left-6 -rotate-12 pointer-events-none"
          style={{ opacity: likeOpacity }}
        >
          <div
            className="px-5 py-2 rounded-xl border-[3px]"
            style={{ borderColor: "#10B981", background: "rgba(16,185,129,0.1)" }}
          >
            <span className="text-3xl font-black tracking-wider" style={{ color: "#10B981" }}>
              LIKE
            </span>
          </div>
        </motion.div>

        {/* NOPE stamp */}
        <motion.div
          className="absolute top-12 right-6 rotate-12 pointer-events-none"
          style={{ opacity: nopeOpacity }}
        >
          <div
            className="px-5 py-2 rounded-xl border-[3px]"
            style={{ borderColor: "#FF2D78", background: "rgba(255,45,120,0.1)" }}
          >
            <span className="text-3xl font-black tracking-wider" style={{ color: "#FF2D78" }}>
              NOPE
            </span>
          </div>
        </motion.div>

        {/* SUPER LIKE stamp */}
        {superLikeAvailable && (
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ opacity: superLikeOpacity }}
          >
            <div
              className="px-5 py-2 rounded-xl border-[3px] text-center"
              style={{ borderColor: "#FFB800", background: "rgba(255,184,0,0.1)" }}
            >
              <span className="text-2xl font-black tracking-wider" style={{ color: "#FFB800" }}>
                SUPER LIKE
              </span>
            </div>
          </motion.div>
        )}

        {/* Profile info — bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          <h2 className="text-3xl font-black mb-1.5 drop-shadow-lg" style={{ color: "#F0F0FF" }}>
            {firstName}
          </h2>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {profile.relation_type && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  color: "#F0F0FF",
                }}
              >
                {RELATION_LABELS[profile.relation_type] ?? profile.relation_type}
              </span>
            )}
            {profile.table_number && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,184,0,0.15)",
                  color: "#FFB800",
                }}
              >
                Mesa {profile.table_number}
              </span>
            )}
          </div>

          {interests.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(4px)",
                    color: "#ccc",
                  }}
                >
                  {INTEREST_EMOJI[interest] ?? "✨"} {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {isTop && !exiting && (
          <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-5 pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); exitCard("left"); }}
              aria-label="No me interesa"
              className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{
                background: "rgba(7,7,15,0.6)",
                backdropFilter: "blur(12px)",
                border: "2px solid rgba(255,45,120,0.3)",
              }}
            >
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={2.5}>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); if (superLikeAvailable) exitCard("up"); }}
              aria-label="Super like"
              disabled={!superLikeAvailable}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-90 disabled:opacity-20"
              style={{
                background: "rgba(7,7,15,0.6)",
                backdropFilter: "blur(12px)",
                border: `2px solid ${superLikeAvailable ? "rgba(255,184,0,0.4)" : "rgba(255,255,255,0.05)"}`,
              }}
            >
              <svg width={18} height={18} fill="#FFB800" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); exitCard("right"); }}
              aria-label="Me gusta"
              className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{
                background: "rgba(16,185,129,0.15)",
                backdropFilter: "blur(12px)",
                border: "2px solid rgba(16,185,129,0.4)",
              }}
            >
              <svg width={24} height={24} fill="#10B981" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
