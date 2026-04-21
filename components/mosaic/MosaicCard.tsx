"use client";

import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import type { Profile } from "@/components/swipe/SwipeCard";

export type LikeState = "none" | "like" | "super_like";

interface MosaicCardProps {
  profile: Profile;
  likeState: LikeState;
  superLikeAvailable: boolean;
  onOpen: () => void;
  onLike: () => void;
  onSuperLike: () => void;
}

export default function MosaicCard({
  profile,
  likeState,
  superLikeAvailable,
  onOpen,
  onLike,
  onSuperLike,
}: MosaicCardProps) {
  const isLike = likeState === "like";
  const isSuper = likeState === "super_like";

  const borderColor = isSuper
    ? "rgba(255,184,0,0.85)"
    : isLike
    ? "rgba(255,45,120,0.85)"
    : "rgba(255,255,255,0.06)";

  const glow = isSuper
    ? "0 0 0 2px rgba(255,184,0,0.4), 0 10px 30px rgba(255,184,0,0.25)"
    : isLike
    ? "0 0 0 2px rgba(255,45,120,0.4), 0 10px 30px rgba(255,45,120,0.25)"
    : "0 4px 18px rgba(0,0,0,0.4)";

  const photo = profile.selfie_url || profile.user?.avatar_url || "";
  const name = profile.display_name || profile.user?.full_name?.split(" ")[0] || "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        aspectRatio: "3 / 4",
        background: "#0F0F1A",
        border: `1.5px solid ${borderColor}`,
        boxShadow: glow,
        transition: "border-color 220ms ease, box-shadow 220ms ease",
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ver perfil de ${name}`}
        className="absolute inset-0 w-full h-full"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "#1A1A2E" }}>
            ✨
          </div>
        )}

        {/* top -> bottom gradient for name legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 40%, transparent 70%)",
          }}
        />

        {/* Name */}
        <div className="absolute left-3 right-3 bottom-12 text-left">
          <div className="text-white font-bold text-base drop-shadow-md truncate">{name}</div>
          {typeof profile.compatibility_score === "number" && profile.compatibility_score > 0 && (
            <div className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
              {profile.compatibility_score}% afinidad
            </div>
          )}
        </div>
      </button>

      {/* Bottom action bar — absolute, above click zone */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-2 py-2 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          aria-label={isLike || isSuper ? "Quitar like" : "Me gusta"}
          className="flex-1 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: isLike
              ? "linear-gradient(135deg,#FF2D78,#D91A62)"
              : "rgba(20,20,30,0.75)",
            border: `1px solid ${isLike ? "rgba(255,45,120,0.6)" : "rgba(255,255,255,0.1)"}`,
            backdropFilter: "blur(8px)",
          }}
        >
          <Heart
            size={16}
            strokeWidth={2.5}
            fill={isLike ? "#FFFFFF" : "transparent"}
            color={isLike ? "#FFFFFF" : "#FF2D78"}
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!superLikeAvailable && !isSuper) return;
            onSuperLike();
          }}
          disabled={!superLikeAvailable && !isSuper}
          aria-label={isSuper ? "Quitar super like" : "Super like"}
          className="flex-1 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isSuper
              ? "linear-gradient(135deg,#FFB800,#D4950A)"
              : "rgba(20,20,30,0.75)",
            border: `1px solid ${isSuper ? "rgba(255,184,0,0.65)" : "rgba(255,255,255,0.1)"}`,
            backdropFilter: "blur(8px)",
          }}
        >
          <Star
            size={16}
            strokeWidth={2.5}
            fill={isSuper ? "#FFFFFF" : "transparent"}
            color={isSuper ? "#FFFFFF" : "#FFB800"}
          />
        </button>
      </div>

      {/* Faded status footer */}
      {(isLike || isSuper) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 flex items-center justify-center px-3 py-1.5 pointer-events-none"
          style={{
            background: isSuper
              ? "linear-gradient(to bottom, rgba(255,184,0,0.7), rgba(255,184,0,0))"
              : "linear-gradient(to bottom, rgba(255,45,120,0.7), rgba(255,45,120,0))",
          }}
        >
          <span
            className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-white drop-shadow"
          >
            {isSuper ? "Super like ★" : "Te gustó ♥"}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
