"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Star } from "lucide-react";
import type { Profile } from "@/components/swipe/SwipeCard";
import { getRelationLabel } from "@/lib/utils/relationLabels";
import type { LikeState } from "./MosaicCard";

interface ExpandedProfileSheetProps {
  profile: Profile | null;
  likeState: LikeState;
  superLikeAvailable: boolean;
  onClose: () => void;
  onLike: () => void;
  onSuperLike: () => void;
}

export default function ExpandedProfileSheet({
  profile,
  likeState,
  superLikeAvailable,
  onClose,
  onLike,
  onSuperLike,
}: ExpandedProfileSheetProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!profile) return;
    setPhotoIndex(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profile, onClose]);

  if (!profile) return null;

  const gallery = (profile.gallery_photos ?? []).filter(Boolean);
  const mainPhoto = profile.selfie_url || profile.user?.avatar_url || "";
  const photos = [mainPhoto, ...gallery].filter(Boolean);

  const name = profile.display_name || profile.user?.full_name?.split(" ")[0] || "";
  const fullName = profile.user?.full_name || "";
  const interests = Array.isArray(profile.interests) ? (profile.interests as string[]) : [];
  const sharedInterests = profile.shared_interests ?? [];
  const relationLabel = profile.relation_type ? getRelationLabel(profile.relation_type) : null;

  const isLike = likeState === "like";
  const isSuper = likeState === "super_like";

  return (
    <AnimatePresence>
      <motion.div
        key="expanded-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        style={{ background: "rgba(5,5,12,0.92)", backdropFilter: "blur(16px)" }}
      >
        <motion.div
          key="expanded-sheet"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="absolute inset-0 flex flex-col"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          {/* REGRESAR button — prominent, sticky top */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3" style={{
            background: "linear-gradient(to bottom, rgba(5,5,12,0.85), transparent)",
          }}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Regresar al mosaico"
              className="flex items-center gap-1.5 h-10 px-4 rounded-full active:scale-95 transition-transform"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(12px)",
              }}
            >
              <ArrowLeft size={18} color="#FAFAFA" strokeWidth={2.5} />
              <span className="text-sm font-bold text-white">REGRESAR</span>
            </button>
            {(isLike || isSuper) && (
              <div
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: isSuper ? "rgba(255,184,0,0.18)" : "rgba(255,45,120,0.18)",
                  color: isSuper ? "#FFB800" : "#FF2D78",
                  border: `1px solid ${isSuper ? "rgba(255,184,0,0.4)" : "rgba(255,45,120,0.4)"}`,
                }}
              >
                {isSuper ? "Super like" : "Te gustó"}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Photos — horizontal snap scroll */}
            <div
              className="relative flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
              onScroll={(e) => {
                const el = e.currentTarget;
                const i = Math.round(el.scrollLeft / el.clientWidth);
                setPhotoIndex(Math.max(0, Math.min(photos.length - 1, i)));
              }}
              style={{ scrollbarWidth: "none" }}
            >
              {photos.length === 0 && (
                <div className="w-full aspect-[4/5] flex items-center justify-center text-6xl shrink-0 snap-center" style={{ background: "#0F0F1A" }}>
                  ✨
                </div>
              )}
              {photos.map((src, i) => (
                <div key={i} className="w-full shrink-0 snap-center" style={{ aspectRatio: "4 / 5" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${name} foto ${i + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 py-2">
                {photos.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: i === photoIndex ? 20 : 6,
                      background: i === photoIndex ? "#FF2D78" : "rgba(255,255,255,0.25)",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Info */}
            <div className="px-5 pt-4 pb-40">
              <div className="flex items-baseline gap-2 mb-1">
                <h2 className="text-2xl font-black text-white">{name}</h2>
                {typeof profile.compatibility_score === "number" && profile.compatibility_score > 0 && (
                  <span className="text-xs font-semibold" style={{ color: "#FF2D78" }}>
                    {profile.compatibility_score}% afinidad
                  </span>
                )}
              </div>
              {fullName && fullName !== name && (
                <div className="text-xs mb-3" style={{ color: "#6A6A8A" }}>{fullName}</div>
              )}

              {relationLabel && (
                <div
                  className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium mb-3"
                  style={{ background: "rgba(123,47,190,0.15)", color: "#B47BE8", border: "1px solid rgba(123,47,190,0.3)" }}
                >
                  {relationLabel}
                </div>
              )}

              {profile.bio && (
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#D0D0E5" }}>
                  {profile.bio}
                </p>
              )}

              {profile.table_visible !== false && profile.table_number && (
                <div className="mb-4 flex items-center gap-2 text-xs" style={{ color: "#8585A8" }}>
                  <span>Mesa</span>
                  <span className="px-2 py-0.5 rounded-md font-mono font-bold text-white" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {profile.table_number}
                  </span>
                </div>
              )}

              {interests.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6A6A8A" }}>
                    Intereses
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map((i) => {
                      const shared = sharedInterests.includes(i);
                      return (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-xs"
                          style={{
                            background: shared ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.05)",
                            color: shared ? "#FF2D78" : "#C0C0D8",
                            border: `1px solid ${shared ? "rgba(255,45,120,0.35)" : "rgba(255,255,255,0.08)"}`,
                          }}
                        >
                          {i}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky bottom action bar */}
          <div
            className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-5"
            style={{
              paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
              background: "linear-gradient(to top, rgba(5,5,12,0.98) 40%, transparent)",
            }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onLike}
                aria-label={isLike || isSuper ? "Quitar like" : "Me gusta"}
                className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-transform"
                style={{
                  background: isLike
                    ? "linear-gradient(135deg,#FF2D78,#D91A62)"
                    : "rgba(20,20,30,0.9)",
                  border: `1.5px solid ${isLike ? "rgba(255,45,120,0.6)" : "rgba(255,45,120,0.35)"}`,
                  color: isLike ? "#FFFFFF" : "#FF2D78",
                  boxShadow: isLike ? "0 8px 24px rgba(255,45,120,0.35)" : "none",
                }}
              >
                <Heart size={20} strokeWidth={2.5} fill={isLike ? "#FFFFFF" : "transparent"} />
                {isLike ? "TE GUSTA" : "ME GUSTA"}
              </button>

              <button
                type="button"
                onClick={onSuperLike}
                disabled={!superLikeAvailable && !isSuper}
                aria-label={isSuper ? "Quitar super like" : "Super like"}
                className="h-14 px-5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: isSuper
                    ? "linear-gradient(135deg,#FFB800,#D4950A)"
                    : "rgba(20,20,30,0.9)",
                  border: `1.5px solid ${isSuper ? "rgba(255,184,0,0.6)" : "rgba(255,184,0,0.35)"}`,
                  color: isSuper ? "#FFFFFF" : "#FFB800",
                  boxShadow: isSuper ? "0 8px 24px rgba(255,184,0,0.35)" : "none",
                }}
              >
                <Star size={20} strokeWidth={2.5} fill={isSuper ? "#FFFFFF" : "transparent"} />
                {isSuper ? "SUPER" : "SUPER"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
